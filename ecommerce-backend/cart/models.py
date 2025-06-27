from django.db import models
from django.conf import settings


class Cart(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, related_name='cart', on_delete=models.CASCADE)
    session_key = models.CharField(max_length=40, blank=True, null=True)  # For anonymous users
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Cart for {self.user.email if self.user else self.session_key}'

    @property
    def total_price(self):
        return sum(item.total_price for item in self.items.all())

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())

    @property
    def total_weight(self):
        """Calculate total weight of items in cart"""
        total = 0
        for item in self.items.all():
            if item.product.weight:
                total += item.product.weight * item.quantity
        return total

    def clear(self):
        """Remove all items from cart"""
        self.items.all().delete()


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE)
    variant = models.ForeignKey('products.ProductVariant', on_delete=models.CASCADE, blank=True, null=True)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('cart', 'product', 'variant')
        ordering = ['-added_at']

    def __str__(self):
        variant_str = f" ({self.variant.name})" if self.variant else ""
        return f'{self.quantity} x {self.product.name}{variant_str}'

    @property
    def unit_price(self):
        """Get the effective price per unit"""
        if self.variant and self.variant.price:
            return self.variant.price
        return self.product.price

    @property
    def total_price(self):
        return self.quantity * self.unit_price

    @property
    def available_stock(self):
        """Get available stock for this item"""
        if self.variant:
            return self.variant.stock
        return self.product.stock

    def can_add_quantity(self, quantity=1):
        """Check if we can add more quantity"""
        return self.quantity + quantity <= self.available_stock


class SavedItem(models.Model):
    """Wishlist/Saved for later items"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='saved_items', on_delete=models.CASCADE)
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE)
    variant = models.ForeignKey('products.ProductVariant', on_delete=models.CASCADE, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product', 'variant')
        ordering = ['-created_at']

    def __str__(self):
        variant_str = f" ({self.variant.name})" if self.variant else ""
        return f'{self.user.email} saved {self.product.name}{variant_str}'


class Coupon(models.Model):
    """Discount coupons"""
    DISCOUNT_TYPE_CHOICES = [
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed Amount'),
        ('free_shipping', 'Free Shipping'),
    ]
    
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    minimum_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    maximum_discount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    usage_limit = models.PositiveIntegerField(blank=True, null=True)
    used_count = models.PositiveIntegerField(default=0)
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.code} - {self.name}"

    @property
    def is_valid(self):
        """Check if coupon is currently valid"""
        from django.utils import timezone
        now = timezone.now()
        return (
            self.is_active and
            self.valid_from <= now <= self.valid_until and
            (not self.usage_limit or self.used_count < self.usage_limit)
        )

    def can_be_used_by(self, user, cart_total):
        """Check if coupon can be used by specific user with cart total"""
        return (
            self.is_valid and
            cart_total >= self.minimum_amount
        )

    def calculate_discount(self, cart_total):
        """Calculate discount amount for given cart total"""
        if not self.can_be_used_by(None, cart_total):
            return 0

        if self.discount_type == 'percentage':
            discount = cart_total * (self.discount_value / 100)
            if self.maximum_discount:
                discount = min(discount, self.maximum_discount)
            return discount
        elif self.discount_type == 'fixed':
            return min(self.discount_value, cart_total)
        elif self.discount_type == 'free_shipping':
            return 0  # Handled separately in shipping calculation
        return 0


class AppliedCoupon(models.Model):
    """Track applied coupons to carts"""
    cart = models.OneToOneField(Cart, related_name='applied_coupon', on_delete=models.CASCADE)
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2)
    applied_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.coupon.code} applied to cart {self.cart.id}"
