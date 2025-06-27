from django.core.management.base import BaseCommand
from ecommerce_app.models import Category, Product


class Command(BaseCommand):
    help = 'Populate database with sample data'

    def handle(self, *args, **options):
        # Create categories
        electronics = Category.objects.get_or_create(name='Electronics')[0]
        clothing = Category.objects.get_or_create(name='Clothing')[0]
        books = Category.objects.get_or_create(name='Books')[0]
        
        # Create products
        products_data = [
            {
                'name': 'iPhone 15',
                'description': 'Latest iPhone with advanced features',
                'price': 999.99,
                'category': electronics,
                'stock': 50
            },
            {
                'name': 'MacBook Pro',
                'description': 'Powerful laptop for professionals',
                'price': 1999.99,
                'category': electronics,
                'stock': 30
            },
            {
                'name': 'Nike Air Max',
                'description': 'Comfortable running shoes',
                'price': 149.99,
                'category': clothing,
                'stock': 100
            },
            {
                'name': 'Levi\'s Jeans',
                'description': 'Classic denim jeans',
                'price': 79.99,
                'category': clothing,
                'stock': 75
            },
            {
                'name': 'Python Programming',
                'description': 'Learn Python programming',
                'price': 39.99,
                'category': books,
                'stock': 200
            },
            {
                'name': 'Django Web Development',
                'description': 'Build web applications with Django',
                'price': 49.99,
                'category': books,
                'stock': 150
            }
        ]
        
        for product_data in products_data:
            product, created = Product.objects.get_or_create(
                name=product_data['name'],
                defaults=product_data
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created product: {product.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Product already exists: {product.name}')
                )
        
        self.stdout.write(
            self.style.SUCCESS('Successfully populated database with sample data')
        )
