// File: frontend/src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Allow overriding the backend API URL using an environment variable on deployment platforms (REACT_APP_API_BASE_URL)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/products';

// Static categories and brand mapping (brand names per category)
const categories = ['Fruits', 'Electronics', 'Furniture', 'Clothes', 'Kitchen', 'Stationery'];
const brandsMapping = {
  Fruits: ['FarmFresh', 'OrganicValley', 'TropicalTaste'],
  Electronics: ['Sony', 'Samsung', 'Apple', 'Xiaomi', 'OnePlus'],
  Furniture: ['Ikea', 'HomeTown', 'Magnolia'],
  Clothes: ['Zara', 'H&M', 'Uniqlo', 'Levis'],
  Kitchen: ['Prestige', 'Wonderchef', 'Philips'],
  Stationery: ['Reynolds', 'Camlin', 'Staedtler']
};

function App() {
  // Helper function to format price in Rupees
  const formatPrice = (price) => {
    return `₹${Number(price).toLocaleString('en-IN', { 
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    })}`;
  };
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [statistics, setStatistics] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
    const [suppliers, setSuppliers] = useState(Object.values(brandsMapping).flat().sort());
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedSupplier, setSelectedSupplier] = useState('all');
    const [theme, setTheme] = useState('light'); // 'light' or 'dark'
  const [formData, setFormData] = useState({
    name: '',
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
    // initialize suppliers list (all brands)
    setSuppliers(Object.values(brandsMapping).flat().sort());
    // set page title
    document.title = 'TrackNStock – tracks and stocks everything easily';
  }, []);

  // Whenever the selected category changes, update the available brands
  useEffect(() => {
    if (selectedCategory === 'all') {
      setSuppliers(Object.values(brandsMapping).flat().sort());
    } else {
      const brands = brandsMapping[selectedCategory] || [];
      setSuppliers(brands);
      // if selected supplier no longer applies, reset it
      if (selectedSupplier !== 'all' && !brands.includes(selectedSupplier)) {
        setSelectedSupplier('all');
      }
    }
  }, [selectedCategory, selectedSupplier]);

    // Fetch categories and suppliers
    // Note: categories and brands are static client-side now. Backend endpoints remain available but are not used for categories/brands.

  // Filter and search products
  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(p => 
        (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        ((p.sku || '')).toLowerCase().includes(searchTerm.toLowerCase()) ||
        ((p.supplier || '')).toLowerCase().includes(searchTerm.toLowerCase()) ||
        ((p.category || '')).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus === 'low') {
      filtered = filtered.filter(p => p.quantity <= p.minStock);
    } else if (filterStatus === 'in-stock') {
      filtered = filtered.filter(p => p.quantity > p.minStock);
    }

      if (selectedCategory !== 'all') {
        filtered = filtered.filter(p => (p.category || '').toLowerCase() === selectedCategory.toLowerCase());
      }

      if (selectedSupplier !== 'all') {
        filtered = filtered.filter(p => (p.supplier || '').toLowerCase() === selectedSupplier.toLowerCase());
      }

    setFilteredProducts(filtered);
    }, [searchTerm, filterStatus, selectedCategory, selectedSupplier, products]);

  const getStockStatus = (product) => {
    if (product.quantity === 0) return { label: 'Out of Stock', color: 'status-out' };
    if (product.quantity <= product.minStock) return { label: 'Low Stock', color: 'status-low' };
    return { label: 'In Stock', color: 'status-in' };
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddProduct = async () => {
    if (!formData.name || !formData.category || !formData.quantity || 
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
  setFormData({ name: '', category: '', quantity: '', minStock: '', price: '', supplier: '' });
      fetchProducts();
      fetchStatistics();
      alert('Product added successfully!');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditProduct = async () => {
    if (!formData.name || !formData.category || !formData.quantity || 
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
  setFormData({ name: '', category: '', quantity: '', minStock: '', price: '', supplier: '' });
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
      category: product.category,
      quantity: product.quantity.toString(),
      minStock: product.minStock.toString(),
      price: product.price.toString(),
      supplier: product.supplier
    });
    setShowEditModal(true);
  };

  const openAddModal = () => {
    // initialize category in the add modal from selectedCategory (nav) if available
    const initCategory = selectedCategory === 'all' ? '' : selectedCategory;
  setFormData({ name: '', category: initCategory, quantity: '', minStock: '', price: '', supplier: '' });
    setShowAddModal(true);
  };

  const exportToCSV = () => {
    const headers = ['Brand', 'Name', 'Category', 'Quantity', 'Min Stock', 'Price (₹)', 'Status'];
    const rows = products.map(p => [
      p.supplier,
      p.name,
      p.category,
      p.quantity,
      p.minStock,
      p.price,
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
    <div className={"app" + (theme === 'dark' ? ' dark' : '')}>
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
                <h1>TrackNStock</h1>
                <p>tracks and stocks everything easily</p>
              </div>
            </div>
                <button className="btn-primary" onClick={openAddModal}>
              <span>+</span> Add Product
            </button>
                <button className="theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? '🌙 Dark' : '☀️ Light'}</button>
          </div>
            <div className="nav-filters">
              <div className="nav-filter">
                <label>Category:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="nav-filter">
                <label>Brand:</label>
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Brands</option>
                  {suppliers.map(supplier => (
                    <option key={supplier} value={supplier}>{supplier}</option>
                  ))}
                </select>
              </div>
              <div className="nav-brand-buttons">
                {/* quick brand buttons for the selected category */}
                {(selectedCategory === 'all' ? suppliers.slice(0,6) : (brandsMapping[selectedCategory] || []) ).map(b => (
                  <button key={b} className={`brand-btn ${selectedSupplier===b? 'active':''}`} onClick={() => setSelectedSupplier(selectedSupplier===b? 'all' : b)}>{b}</button>
                ))}
              </div>
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
                  <p className="stat-value stat-value-green">{formatPrice(statistics.totalValue || 0)}</p>
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
                  placeholder="Search by name, brand, or category..."
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
                      <th>Brand</th>
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
                          <td>{product.supplier}</td>
                          <td>{product.category}</td>
                          <td><strong>{product.quantity}</strong></td>
                          <td>{product.minStock}</td>
                          <td><strong>{formatPrice(product.price)}</strong></td>
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
              <select name="category" value={formData.category} onChange={handleInputChange} className="input">
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="input-group">
                <input name="quantity" type="number" value={formData.quantity} onChange={handleInputChange} placeholder="Quantity" className="input" />
                <input name="minStock" type="number" value={formData.minStock} onChange={handleInputChange} placeholder="Min Stock" className="input" />
              </div>
              <input name="price" type="number" step="0.01" value={formData.price} onChange={handleInputChange} placeholder="Price (₹)" className="input" />
              {/* show brands depending on chosen category in modal; if none selected, show all brands */}
              {(() => {
                const brandsForModal = formData.category ? (brandsMapping[formData.category] || []) : Object.values(brandsMapping).flat().sort();
                return (
                  <select name="supplier" value={formData.supplier} onChange={handleInputChange} className="input">
                    <option value="">Select Brand</option>
                    {brandsForModal.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                );
              })()}
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
              <select name="category" value={formData.category} onChange={handleInputChange} className="input">
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="input-group">
                <input name="quantity" type="number" value={formData.quantity} onChange={handleInputChange} placeholder="Quantity" className="input" />
                <input name="minStock" type="number" value={formData.minStock} onChange={handleInputChange} placeholder="Min Stock" className="input" />
              </div>
              <input name="price" type="number" step="0.01" value={formData.price} onChange={handleInputChange} placeholder="Price (₹)" className="input" />
              {(() => {
                const brandsForModal = formData.category ? (brandsMapping[formData.category] || []) : Object.values(brandsMapping).flat().sort();
                return (
                  <select name="supplier" value={formData.supplier} onChange={handleInputChange} className="input">
                    <option value="">Select Brand</option>
                    {brandsForModal.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                );
              })()}
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
