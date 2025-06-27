from django.db import models
from django.conf import settings
import uuid


class PaymentMethod(models.Model):
    """Available payment methods"""
    PAYMENT_TYPE_CHOICES = [
        ('credit_card', 'Credit Card'),
        ('debit_card', 'Debit Card'),
        ('paypal', 'PayPal'),
        ('stripe', 'Stripe'),
        ('bank_transfer', 'Bank Transfer'),
        ('cash_on_delivery', 'Cash on Delivery'),
        ('wallet', 'Digital Wallet'),
    ]
    
    name = models.CharField(max_length=100)
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    processing_fee_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    processing_fee_fixed = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    min_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    configuration = models.JSONField(default=dict, blank=True)  # Store gateway-specific config
    
    def __str__(self):
        return self.name

    def calculate_processing_fee(self, amount):
        """Calculate processing fee for given amount"""
        fee = (amount * self.processing_fee_percentage / 100) + self.processing_fee_fixed
        return fee


class PaymentTransaction(models.Model):
    """Individual payment transactions"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
        ('partially_refunded', 'Partially Refunded'),
    ]
    
    TRANSACTION_TYPE_CHOICES = [
        ('payment', 'Payment'),
        ('refund', 'Refund'),
        ('partial_refund', 'Partial Refund'),
        ('chargeback', 'Chargeback'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey('orders.Order', related_name='transactions', on_delete=models.CASCADE)
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.CASCADE)
    
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES, default='payment')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    processing_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Gateway information
    gateway_transaction_id = models.CharField(max_length=255, blank=True)
    gateway_response = models.JSONField(default=dict, blank=True)
    gateway_fees = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Payment details
    card_last_four = models.CharField(max_length=4, blank=True)
    card_brand = models.CharField(max_length=20, blank=True)
    billing_address = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    processed_at = models.DateTimeField(blank=True, null=True)
    
    # Additional information
    notes = models.TextField(blank=True)
    failure_reason = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['gateway_transaction_id']),
            models.Index(fields=['order', '-created_at']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.transaction_type.title()} {self.amount} for Order {self.order.order_number}"

    @property
    def net_amount(self):
        """Amount after processing fees"""
        return self.amount - self.processing_fee - self.gateway_fees


class StripePaymentIntent(models.Model):
    """Track Stripe Payment Intents"""
    transaction = models.OneToOneField(PaymentTransaction, on_delete=models.CASCADE, related_name='stripe_intent')
    payment_intent_id = models.CharField(max_length=255, unique=True)
    client_secret = models.CharField(max_length=255)
    status = models.CharField(max_length=50)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Stripe Intent {self.payment_intent_id}"


class PaymentWebhook(models.Model):
    """Track payment gateway webhooks"""
    gateway = models.CharField(max_length=50)  # stripe, paypal, etc.
    event_id = models.CharField(max_length=255)
    event_type = models.CharField(max_length=100)
    event_data = models.JSONField(default=dict)
    processed = models.BooleanField(default=False)
    processed_at = models.DateTimeField(blank=True, null=True)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['gateway', 'event_id']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.gateway} webhook {self.event_type}"


class SavedPaymentMethod(models.Model):
    """User's saved payment methods"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='saved_payment_methods', on_delete=models.CASCADE)
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.CASCADE)
    
    # Tokenized payment information
    gateway_customer_id = models.CharField(max_length=255, blank=True)
    gateway_payment_method_id = models.CharField(max_length=255)
    
    # Display information
    nickname = models.CharField(max_length=100, blank=True)
    card_last_four = models.CharField(max_length=4, blank=True)
    card_brand = models.CharField(max_length=20, blank=True)
    card_exp_month = models.PositiveIntegerField(blank=True, null=True)
    card_exp_year = models.PositiveIntegerField(blank=True, null=True)
    
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_default', '-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.card_brand} ****{self.card_last_four}"

    def save(self, *args, **kwargs):
        # Ensure only one default payment method per user
        if self.is_default:
            SavedPaymentMethod.objects.filter(
                user=self.user, 
                is_default=True
            ).update(is_default=False)
        super().save(*args, **kwargs)


class PaymentFailure(models.Model):
    """Track payment failures for analysis"""
    FAILURE_TYPE_CHOICES = [
        ('insufficient_funds', 'Insufficient Funds'),
        ('card_declined', 'Card Declined'),
        ('expired_card', 'Expired Card'),
        ('invalid_card', 'Invalid Card'),
        ('processing_error', 'Processing Error'),
        ('fraud_suspected', 'Fraud Suspected'),
        ('network_error', 'Network Error'),
        ('other', 'Other'),
    ]
    
    transaction = models.ForeignKey(PaymentTransaction, on_delete=models.CASCADE, related_name='failures')
    failure_type = models.CharField(max_length=30, choices=FAILURE_TYPE_CHOICES)
    failure_code = models.CharField(max_length=50, blank=True)
    failure_message = models.TextField()
    gateway_error_code = models.CharField(max_length=100, blank=True)
    gateway_error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Payment failure: {self.failure_type} for {self.transaction.id}"


class RefundRequest(models.Model):
    """Customer refund requests"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('processed', 'Processed'),
    ]
    
    REASON_CHOICES = [
        ('defective_product', 'Defective Product'),
        ('wrong_item', 'Wrong Item Received'),
        ('not_as_described', 'Not as Described'),
        ('changed_mind', 'Changed Mind'),
        ('duplicate_order', 'Duplicate Order'),
        ('other', 'Other'),
    ]
    
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, related_name='refund_requests')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    amount_requested = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.CharField(max_length=30, choices=REASON_CHOICES)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Processing information
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        blank=True, 
        null=True,
        related_name='reviewed_refunds'
    )
    admin_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)
    processed_at = models.DateTimeField(blank=True, null=True)
    
    def __str__(self):
        return f"Refund request ${self.amount_requested} for {self.order.order_number}"
