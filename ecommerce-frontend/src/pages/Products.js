import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
  });
  
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      
      const response = await productsAPI.getProducts(params);
      setProducts(response.data.results);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setFilters({
      ...filters,
      search: e.target.value,
    });
  };

  const handleCategoryChange = (categoryId) => {
    setFilters({
      ...filters,
      category: categoryId,
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
    });
  };

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      return;
    }
    
    const result = await addToCart(productId, 1);
    if (result.success) {
      alert('Product added to cart!');
    } else {
      alert('Failed to add product to cart');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Products</h1>
          <p className="text-gray-600">Discover our amazing collection of products</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Products
              </label>
              <input
                id="search"
                type="text"
                placeholder="Search for products..."
                value={filters.search}
                onChange={handleSearchChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Category Filter */}
            <div className="md:w-64">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                value={filters.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Categories</option>
                {categories&&categories.length>=0&&categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            {(filters.search || filters.category) && (
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or browse all products.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <Link to={`/products/${product.id}`}>
                  <div className="aspect-w-1 aspect-h-1 bg-gray-200">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-4">
                  <div className="mb-2">
                    <span className="text-xs text-primary-600 font-medium bg-primary-50 px-2 py-1 rounded">
                      {product.category_name}
                    </span>
                  </div>
                  
                  <Link to={`/products/${product.id}`}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-primary-600">
                      ${product.price}
                    </span>
                    <span className={`text-sm ${product.is_in_stock ? 'text-green-600' : 'text-red-600'}`}>
                      {product.is_in_stock ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      to={`/products/${product.id}`}
                      className="flex-1 px-3 py-2 border border-primary-600 text-primary-600 text-center rounded-md hover:bg-primary-50 transition-colors text-sm"
                    >
                      View Details
                    </Link>
                    {isAuthenticated && (
                      <button
                        onClick={() => handleAddToCart(product.id)}
                        className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                        disabled={!product.is_in_stock}
                      >
                        {product.is_in_stock ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
