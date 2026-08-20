import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertTriangle, Upload } from 'lucide-react';
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
      alert('Please provide or upload at least one valid image for the product.');
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
          <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.55)' }}>Manage your prices, inventory and descriptors.</span>
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
                    style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.15)' }} 
                  />
                </td>
                <td style={{ fontWeight: 600 }}>{p.sku}</td>
                <td style={{ fontWeight: 500, maxWidth: '300px' }}>
                  <div style={{ fontWeight: 600, color: '#ffffff' }}>{p.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.55)' }}>Material: {p.material} | Color: {p.color}</div>
                </td>
                <td style={{ textTransform: 'capitalize' }}>
                  {p.category_id}
                </td>
                <td>
                  {p.sale_price ? (
                    <div>
                      <span style={{ color: 'var(--color-error)', fontWeight: 600 }}>{formatUGX(p.sale_price)}</span> <br />
                      <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: 'rgba(255, 255, 255, 0.45)' }}>{formatUGX(p.price)}</span>
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
                    {p.featured && <span style={{ fontSize: '0.65rem', background: 'rgba(194, 139, 83, 0.2)', color: 'var(--color-gold-light)', padding: '0.1rem 0.3rem', borderRadius: '2px', border: '1px solid rgba(194, 139, 83, 0.3)', fontWeight: 'bold' }}>Featured</span>}
                    {p.new_arrival && <span style={{ fontSize: '0.65rem', background: 'rgba(22, 163, 74, 0.15)', color: '#34d399', padding: '0.1rem 0.3rem', borderRadius: '2px', border: '1px solid rgba(22, 163, 74, 0.3)', fontWeight: 'bold' }}>New</span>}
                    {p.best_seller && <span style={{ fontSize: '0.65rem', background: 'rgba(37, 99, 235, 0.15)', color: '#60a5fa', padding: '0.1rem 0.3rem', borderRadius: '2px', border: '1px solid rgba(37, 99, 235, 0.3)', fontWeight: 'bold' }}>Best</span>}
                    {p.limited_edition && <span style={{ fontSize: '0.65rem', background: 'rgba(147, 51, 234, 0.15)', color: '#c084fc', padding: '0.1rem 0.3rem', borderRadius: '2px', border: '1px solid rgba(147, 51, 234, 0.3)', fontWeight: 'bold' }}>Limited</span>}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleOpenEdit(p)}
                      style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
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
              <h2 style={{ fontSize: '1.3rem', color: '#ffffff' }}>{editingProduct ? `Edit ${editingProduct.sku}` : 'Add New Product'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ffffff' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#ffffff' }}>Product Name *</label>
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
                  <label className="form-label" style={{ color: '#ffffff' }}>Price (UGX) *</label>
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
                  <label className="form-label" style={{ color: '#ffffff' }}>Sale Price (UGX - Optional)</label>
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
                  <label className="form-label" style={{ color: '#ffffff' }}>SKU *</label>
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
                  <label className="form-label" style={{ color: '#ffffff' }}>Stock Quantity *</label>
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
                  <label className="form-label" style={{ color: '#ffffff' }}>Gender Selection *</label>
                  <select name="gender" value={formData.gender} onChange={handleFormChange} className="form-input">
                    <option value="Women">Women</option>
                    <option value="Men">Men</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#ffffff' }}>Category *</label>
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
                  <label className="form-label" style={{ color: '#ffffff' }}>Subcategory *</label>
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
                  <label className="form-label" style={{ color: '#ffffff' }}>Material *</label>
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
                  <label className="form-label" style={{ color: '#ffffff' }}>Color *</label>
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
                  <label className="form-label" style={{ color: '#ffffff' }}>Occasion *</label>
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
                <label className="form-label" style={{ color: '#ffffff' }}>Description *</label>
                <textarea 
                  name="description" 
                  required 
                  rows="3"
                  value={formData.description}
                  onChange={handleFormChange}
                  className="form-textarea" 
                />
              </div>

              {/* Image Upload/Link Inputs */}
              <div className="form-group" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '1rem', marginTop: '1.2rem' }}>
                <label className="form-label" style={{ color: '#ffffff', marginBottom: '0.8rem', fontSize: '0.9rem' }}>Product Images (Upload local files or paste image URLs) *</label>
                
                {formData.images.map((img, idx) => {
                  const handleFileChange = (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      handleImageChange(idx, reader.result);
                    };
                    reader.readAsDataURL(file);
                  };

                  return (
                    <div key={idx} style={{ marginBottom: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>
                        {idx === 0 ? "Main Image (Required) *" : `Alternative Image ${idx + 1} (Optional)`}
                      </label>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input 
                          type="url"
                          placeholder="Paste image link URL..."
                          value={img.startsWith('data:') ? '[Uploaded Local File]' : img}
                          onChange={(e) => handleImageChange(idx, e.target.value)}
                          className="form-input"
                          style={{ flex: 1 }}
                          required={idx === 0}
                          disabled={img.startsWith('data:')}
                        />
                        <label 
                          className="btn-secondary" 
                          style={{ 
                            padding: '0.55rem 0.8rem', 
                            fontSize: '0.72rem', 
                            whiteSpace: 'nowrap', 
                            margin: 0, 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            border: '1px solid rgba(255, 255, 255, 0.25)',
                            background: img.startsWith('data:') ? 'rgba(194, 139, 83, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                            color: '#ffffff'
                          }}
                        >
                          <Upload size={13} /> File
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            style={{ display: 'none' }} 
                          />
                        </label>
                        {img && (
                          <button 
                            type="button"
                            className="btn-secondary"
                            onClick={() => handleImageChange(idx, '')}
                            style={{ padding: '0.55rem 0.8rem', fontSize: '0.72rem', color: 'var(--color-error)', borderColor: 'rgba(220, 38, 38, 0.3)', background: 'transparent' }}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      {img && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem', padding: '0.2rem 0.4rem', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-gold-light)' }}>Preview:</span>
                          <img 
                            src={img} 
                            alt={`Preview ${idx + 1}`} 
                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.15)' }} 
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Flag Options */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem', padding: '1rem 0' }}>
                <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ffffff', cursor: 'pointer' }}>
                  <input type="checkbox" name="featured" checked={formData.featured} onChange={handleFormChange} />
                  Featured
                </label>
                <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ffffff', cursor: 'pointer' }}>
                  <input type="checkbox" name="new_arrival" checked={formData.new_arrival} onChange={handleFormChange} />
                  New Arrival
                </label>
                <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ffffff', cursor: 'pointer' }}>
                  <input type="checkbox" name="best_seller" checked={formData.best_seller} onChange={handleFormChange} />
                  Best Seller
                </label>
                <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ffffff', cursor: 'pointer' }}>
                  <input type="checkbox" name="limited_edition" checked={formData.limited_edition} onChange={handleFormChange} />
                  Limited Edition
                </label>
                <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ffffff', cursor: 'pointer' }}>
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
