// File: frontend/src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = 'http://localhost:8080/api/products';

function App() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [statistics, setStatistics] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    quantity: '',
    minStock: '',
    price: '',
    supplier: ''
  });
  const [loading, setLoading] = useState(true);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_BASE_URL);
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Error loading products. Make sure the backend is running on port 8080.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/statistics`);
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchStatistics();
  }, []);

  // Filter and search products
  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus === 'low') {
      filtered = filtered.filter(p => p.quantity <= p.minStock);
    } else if (filterStatus === 'in-stock') {
      filtered = filtered.filter(p => p.quantity > p.minStock);
    }

    setFilteredProducts(filtered);
  }, [searchTerm, filterStatus, products]);

  const getStockStatus = (product) => {
    if (product.quantity === 0) return { label: 'Out of Stock', color: 'status-out' };
    if (product.quantity <= product.minStock) return { label: 'Low Stock', color: 'status-low' };
    return { label: 'In Stock', color: 'status-in' };
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddProduct = async () => {
    if (!formData.name || !formData.sku || !formData.category || !formData.quantity || 
        !formData.minStock || !formData.price || !formData.supplier) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await axios.post(API_BASE_URL, {
        ...formData,
        quantity: parseInt(formData.quantity),
        minStock: parseInt(formData.minStock),
        price: parseFloat(formData.price)
      });
      
      setShowAddModal(false);
      setFormData({ name: '', sku: '', category: '', quantity: '', minStock: '', price: '', supplier: '' });
      fetchProducts();
      fetchStatistics();
      alert('Product added successfully!');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditProduct = async () => {
    if (!formData.name || !formData.sku || !formData.category || !formData.quantity || 
        !formData.minStock || !formData.price || !formData.supplier) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await axios.put(`${API_BASE_URL}/${editingProduct.id}`, {
        ...formData,
        quantity: parseInt(formData.quantity),
        minStock: parseInt(formData.minStock),
        price: parseFloat(formData.price)
      });
      
      setShowEditModal(false);
      setEditingProduct(null);
      setFormData({ name: '', sku: '', category: '', quantity: '', minStock: '', price: '', supplier: '' });
      fetchProducts();
      fetchStatistics();
      alert('Product updated successfully!');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`);
        fetchProducts();
        fetchStatistics();
        alert('Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
      }
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      quantity: product.quantity.toString(),
      minStock: product.minStock.toString(),
      price: product.price.toString(),
      supplier: product.supplier
    });
    setShowEditModal(true);
  };

  const exportToCSV = () => {
    const headers = ['SKU', 'Name', 'Category', 'Quantity', 'Min Stock', 'Price', 'Supplier', 'Status'];
    const rows = products.map(p => [
      p.sku,
      p.name,
      p.category,
      p.quantity,
      p.minStock,
      p.price,
      p.supplier,
      getStockStatus(p).label
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_report.csv';
    a.click();
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <div className="logo">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              </div>
              <div>
                <h1>Inventory Management System</h1>
                <p>Track and manage your product stock levels</p>
              </div>
            </div>
            <button className="btn-primary" onClick={() => setShowAddModal(true)}>
              <span>+</span> Add Product
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {/* Statistics Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-content">
                <div>
                  <p className="stat-label">Total Products</p>
                  <p className="stat-value">{statistics.totalProducts || 0}</p>
                </div>
                <div className="stat-icon stat-icon-blue">📦</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div>
                  <p className="stat-label">Low Stock Alert</p>
                  <p className="stat-value stat-value-orange">{statistics.lowStockCount || 0}</p>
                </div>
                <div className="stat-icon stat-icon-orange">⚠️</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div>
                  <p className="stat-label">Out of Stock</p>
                  <p className="stat-value stat-value-red">{statistics.outOfStockCount || 0}</p>
                </div>
                <div className="stat-icon stat-icon-red">📉</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div>
                  <p className="stat-label">Total Value</p>
                  <p className="stat-value stat-value-green">${(statistics.totalValue || 0).toFixed(2)}</p>
                </div>
                <div className="stat-icon stat-icon-green">📈</div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="filters-card">
            <div className="filters-content">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search by name, SKU, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="filters-right">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Products</option>
                  <option value="in-stock">In Stock</option>
                  <option value="low">Low Stock</option>
                </select>

                <button className="btn-secondary" onClick={exportToCSV}>
                  📥 Export
                </button>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="table-card">
            {loading ? (
              <div className="loading">Loading products...</div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Category</th>
                      <th>Quantity</th>
                      <th>Min Stock</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => {
                      const status = getStockStatus(product);
                      return (
                        <tr key={product.id}>
                          <td>
                            <div>
                              <div className="product-name">{product.name}</div>
                              <div className="product-supplier">{product.supplier}</div>
                            </div>
                          </td>
                          <td>{product.sku}</td>
                          <td>{product.category}</td>
                          <td><strong>{product.quantity}</strong></td>
                          <td>{product.minStock}</td>
                          <td><strong>${product.price}</strong></td>
                          <td>
                            <span className={`status-badge ${status.color}`}>
                              {status.label}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-icon btn-edit" onClick={() => openEditModal(product)}>
                                ✏️
                              </button>
                              <button className="btn-icon btn-delete" onClick={() => handleDelete(product.id)}>
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {filteredProducts.length === 0 && (
                  <div className="empty-state">
                    <p>📦</p>
                    <p>No products found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Product</h2>
            </div>
            <div className="modal-body">
              <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Product Name" className="input" />
              <input name="sku" value={formData.sku} onChange={handleInputChange} placeholder="SKU" className="input" />
              <input name="category" value={formData.category} onChange={handleInputChange} placeholder="Category" className="input" />
              <div className="input-group">
                <input name="quantity" type="number" value={formData.quantity} onChange={handleInputChange} placeholder="Quantity" className="input" />
                <input name="minStock" type="number" value={formData.minStock} onChange={handleInputChange} placeholder="Min Stock" className="input" />
              </div>
              <input name="price" type="number" step="0.01" value={formData.price} onChange={handleInputChange} placeholder="Price" className="input" />
              <input name="supplier" value={formData.supplier} onChange={handleInputChange} placeholder="Supplier" className="input" />
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleAddProduct}>Add Product</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Product</h2>
            </div>
            <div className="modal-body">
              <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Product Name" className="input" />
              <input name="sku" value={formData.sku} onChange={handleInputChange} placeholder="SKU" className="input" />
              <input name="category" value={formData.category} onChange={handleInputChange} placeholder="Category" className="input" />
              <div className="input-group">
                <input name="quantity" type="number" value={formData.quantity} onChange={handleInputChange} placeholder="Quantity" className="input" />
                <input name="minStock" type="number" value={formData.minStock} onChange={handleInputChange} placeholder="Min Stock" className="input" />
              </div>
              <input name="price" type="number" step="0.01" value={formData.price} onChange={handleInputChange} placeholder="Price" className="input" />
              <input name="supplier" value={formData.supplier} onChange={handleInputChange} placeholder="Supplier" className="input" />
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleEditProduct}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;