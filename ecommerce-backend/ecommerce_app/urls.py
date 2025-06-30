from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Authentication URLs
    path('auth/register/', views.UserRegistrationView.as_view(), name='user-register'),
    path('auth/login/', views.UserLoginView.as_view(), name='user-login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/profile/', views.UserProfileView.as_view(), name='user-profile'),
    
    # Stripe endpoints
    path('stripe/config/', views.StripeConfigView.as_view(), name='stripe-config'),
    path('stripe/webhook/', views.stripe_webhook, name='stripe-webhook'),
    
    # Category URLs
    path('api/categories/', views.CategoryViewSet.as_view({'get': 'list'}), name='category-list'),
    path('api/categories/<int:pk>/', views.CategoryViewSet.as_view({'get': 'retrieve'}), name='category-detail'),
    
    # Product URLs
    path('api/products/', views.ProductViewSet.as_view({'get': 'list'}), name='product-list'),
    path('api/products/<int:pk>/', views.ProductViewSet.as_view({'get': 'retrieve'}), name='product-detail'),
    
    # Cart URLs
    path('api/cart/', views.CartViewSet.as_view({'get': 'list', 'post': 'create'}), name='cart-list'),
    path('api/cart/<int:pk>/', views.CartViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='cart-detail'),
    path('api/cart/current/', views.CartViewSet.as_view({'get': 'current'}), name='cart-current'),
    path('api/cart/add_item/', views.CartViewSet.as_view({'post': 'add_item'}), name='cart-add-item'),
    path('api/cart/update_item/', views.CartViewSet.as_view({'patch': 'update_item'}), name='cart-update-item'),
    path('api/cart/remove_item/', views.CartViewSet.as_view({'delete': 'remove_item'}), name='cart-remove-item'),
    path('api/cart/clear/', views.CartViewSet.as_view({'delete': 'clear'}), name='cart-clear'),
    
    # Order URLs
    path('api/orders/', views.OrderViewSet.as_view({'get': 'list', 'post': 'create'}), name='order-list'),
    path('api/orders/<int:pk>/', views.OrderViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='order-detail'),
    path('api/orders/create_order/', views.OrderViewSet.as_view({'post': 'create_order'}), name='order-create'),
    path('api/orders/<int:pk>/confirm_payment/', views.OrderViewSet.as_view({'post': 'confirm_payment'}), name='order-confirm-payment'),
]
