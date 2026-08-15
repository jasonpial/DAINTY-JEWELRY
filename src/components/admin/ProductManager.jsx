import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
import { getProducts, saveProduct, deleteProduct, categories, subcategories } from '../../db';
import { formatUGX } from '../customer/ProductCard';

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    sale_price: '',
    category_id: 'rings',
    subcategory_id: '',
    material: 'Gold-Plated',
    color: 'Gold',
    gender: 'Women',
    occasion: 'Everyday',
    stock_quantity: 10,
    sku: '',
    images: ['', '', '', ''],
    featured: false,
    new_arrival: true,
    best_seller: false,
    limited_edition: false,
    clearance: false
  });

  const reloadProducts = () => {
    setProducts(getProducts());
  };

  useEffect(() => {
    reloadProducts();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      sale_price: '',
      category_id: 'rings',
      subcategory_id: 'eng_rings',
      material: 'Gold-Plated',
      color: 'Gold',
      gender: 'Women',
      occasion: 'Everyday',
      stock_quantity: 10,
      sku: 'DSC-RG-' + Math.floor(Math.random() * 900 + 100),
      images: [
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1543294001-f7cbfe92237e?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=800&auto=format&fit=crop&q=80'
      ],
      featured: false,
      new_arrival: true,
      best_seller: false,
      limited_edition: false,
      clearance: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    
    // Pad images if not up to 4
    const imgs = [...product.images];
    while (imgs.length < 4) imgs.push('');

    setFormData({
      ...product,
      price: product.price.toString(),
      sale_price: product.sale_price ? product.sale_price.toString() : '',
      images: imgs
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you absolutely sure you want to delete this jewelry product from your store catalog?')) {
      deleteProduct(id);
      reloadProducts();
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (index, value) => {
    const newImgs = [...formData.images];
    newImgs[index] = value;
    setFormData(prev => ({ ...prev, images: newImgs }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Clean up empty images
    const activeImages = formData.images.filter(img => img.trim() !== '');
    if (activeImages.length === 0) {
      alert('Please provide at least one valid image URL for the product.');
      return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price),
      sale_price: formData.sale_price ? Number(formData.sale_price) : null,
      stock_quantity: Number(formData.stock_quantity),
      images: activeImages
    };

    if (editingProduct) {
      payload.id = editingProduct.id;
    }

    saveProduct(payload);
    setIsModalOpen(false);
    reloadProducts();
  };

  const filteredSubcats = subcategories.filter(s => s.categoryId === formData.category_id);

  return (
    <div className="admin-card animate-fade-in">
      <div className="admin-card-header">
        <div>
          <h2 style={{ fontSize: '1.3rem' }}>Product Catalog ({products.length} Items)</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Manage your prices, inventory and descriptors.</span>
        </div>
        <button className="btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> Add Jewelry Item
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price (UGX)</th>
              <th>Stock</th>
              <th>Status Flags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>
                  <img 
                    src={p.images[0]} 
                    alt={p.name} 
                    style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--color-border-gold)' }} 
                  />
                </td>
                <td style={{ fontWeight: 600 }}>{p.sku}</td>
                <td style={{ fontWeight: 500, maxRaw: '300px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-brown-primary)' }}>{p.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Material: {p.material} | Color: {p.color}</div>
                </td>
                <td style={{ textTransform: 'capitalize' }}>
                  {p.category_id}
                </td>
                <td>
                  {p.sale_price ? (
                    <div>
                      <span style={{ color: 'var(--color-error)', fontWeight: 600 }}>{formatUGX(p.sale_price)}</span> <br />
                      <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: 'var(--color-text-muted)' }}>{formatUGX(p.price)}</span>
                    </div>
                  ) : (
                    <span style={{ fontWeight: 600 }}>{formatUGX(p.price)}</span>
                  )}
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: p.stock_quantity <= 5 ? 'var(--color-error)' : 'inherit' }}>
                    {p.stock_quantity}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    {p.featured && <span style={{ fontSize: '0.65rem', background: 'var(--color-gold-accent)', color: 'var(--color-brown-primary)', padding: '0.1rem 0.3rem', borderRadius: '2px', fontWeight: 'bold' }}>Featured</span>}
                    {p.new_arrival && <span style={{ fontSize: '0.65rem', background: '#dcfce7', color: '#16a34a', padding: '0.1rem 0.3rem', borderRadius: '2px', fontWeight: 'bold' }}>New</span>}
                    {p.best_seller && <span style={{ fontSize: '0.65rem', background: '#dbeafe', color: '#2563eb', padding: '0.1rem 0.3rem', borderRadius: '2px', fontWeight: 'bold' }}>Best</span>}
                    {p.limited_edition && <span style={{ fontSize: '0.65rem', background: '#f3e8ff', color: '#9333ea', padding: '0.1rem 0.3rem', borderRadius: '2px', fontWeight: 'bold' }}>Limited</span>}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleOpenEdit(p)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-brown-primary)', cursor: 'pointer' }}
                      title="Edit Product"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(p.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer' }}
                      title="Delete Product"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <div className="modal-header">
              <h2 style={{ fontSize: '1.3rem' }}>{editingProduct ? `Edit ${editingProduct.sku}` : 'Add New Product'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  value={formData.name}
                  onChange={handleFormChange}
                  className="form-input" 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Price (UGX) *</label>
                  <input 
                    type="number" 
                    name="price" 
                    required 
                    value={formData.price}
                    onChange={handleFormChange}
                    className="form-input" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Sale Price (UGX - Optional)</label>
                  <input 
                    type="number" 
                    name="sale_price" 
                    value={formData.sale_price}
                    onChange={handleFormChange}
                    className="form-input" 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">SKU *</label>
                  <input 
                    type="text" 
                    name="sku" 
                    required 
                    value={formData.sku}
                    onChange={handleFormChange}
                    className="form-input" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity *</label>
                  <input 
                    type="number" 
                    name="stock_quantity" 
                    required 
                    value={formData.stock_quantity}
                    onChange={handleFormChange}
                    className="form-input" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender Selection *</label>
                  <select name="gender" value={formData.gender} onChange={handleFormChange} className="form-input">
                    <option value="Women">Women</option>
                    <option value="Men">Men</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select 
                    name="category_id" 
                    value={formData.category_id} 
                    onChange={(e) => {
                      const newCat = e.target.value;
                      const relatedSub = subcategories.find(s => s.categoryId === newCat);
                      setFormData(prev => ({ 
                        ...prev, 
                        category_id: newCat,
                        subcategory_id: relatedSub ? relatedSub.id : ''
                      }));
                    }} 
                    className="form-input"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Subcategory *</label>
                  <select 
                    name="subcategory_id" 
                    value={formData.subcategory_id} 
                    onChange={handleFormChange} 
                    className="form-input"
                    required
                  >
                    <option value="">-- Choose Subcategory --</option>
                    {filteredSubcats.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Material *</label>
                  <select name="material" value={formData.material} onChange={handleFormChange} className="form-input">
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Stainless Steel">Stainless Steel</option>
                    <option value="Gold-Plated">Gold-Plated</option>
                    <option value="Rose Gold">Rose Gold</option>
                    <option value="Sterling Silver">Sterling Silver</option>
                    <option value="Titanium">Titanium</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Color *</label>
                  <select name="color" value={formData.color} onChange={handleFormChange} className="form-input">
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Rose Gold">Rose Gold</option>
                    <option value="Black">Black</option>
                    <option value="White">White</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Occasion *</label>
                  <select name="occasion" value={formData.occasion} onChange={handleFormChange} className="form-input">
                    <option value="Everyday">Everyday</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Engagement">Engagement</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Valentine's">Valentine's</option>
                    <option value="Graduation">Graduation</option>
                    <option value="Party">Party</option>
                    <option value="Gift">Gift</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea 
                  name="description" 
                  required 
                  rows="3"
                  value={formData.description}
                  onChange={handleFormChange}
                  className="form-textarea" 
                />
              </div>

              {/* Image Inputs */}
              <div className="form-group" style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '1rem', marginTop: '1rem' }}>
                <label className="form-label">Product Image Links (Main, Front, Side, Close-up, Lifestyle) *</label>
                {formData.images.map((img, idx) => (
                  <input 
                    key={idx}
                    type="url"
                    placeholder={idx === 0 ? "Main image (Required)" : `Image ${idx + 1} (Optional)`}
                    value={img}
                    onChange={(e) => handleImageChange(idx, e.target.value)}
                    className="form-input"
                    style={{ marginBottom: '0.4rem' }}
                    required={idx === 0}
                  />
                ))}
              </div>

              {/* Flag Options */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem', padding: '1rem 0' }}>
                <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-brown-primary)' }}>
                  <input type="checkbox" name="featured" checked={formData.featured} onChange={handleFormChange} />
                  Featured
                </label>
                <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-brown-primary)' }}>
                  <input type="checkbox" name="new_arrival" checked={formData.new_arrival} onChange={handleFormChange} />
                  New Arrival
                </label>
                <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-brown-primary)' }}>
                  <input type="checkbox" name="best_seller" checked={formData.best_seller} onChange={handleFormChange} />
                  Best Seller
                </label>
                <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-brown-primary)' }}>
                  <input type="checkbox" name="limited_edition" checked={formData.limited_edition} onChange={handleFormChange} />
                  Limited Edition
                </label>
                <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-brown-primary)' }}>
                  <input type="checkbox" name="clearance" checked={formData.clearance} onChange={handleFormChange} />
                  Clearance
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
