import { useState } from 'react';
import { X, Filter, RotateCcw } from 'lucide-react';
import { subcategories } from '../../db';

export const materialOptions = [
  'Gold', 'Silver', 'Stainless Steel', 'Gold-Plated', 'Rose Gold', 'Sterling Silver', 'Titanium'
];

export const colorOptions = [
  'Gold', 'Silver', 'Rose Gold', 'Black', 'White', 'Mixed'
];

export const priceRanges = [
  { label: 'Under UGX 50,000', id: 'under_50k', min: 0, max: 49999 },
  { label: 'UGX 50,000–100,000', id: '50k_100k', min: 50000, max: 100000 },
  { label: 'UGX 100,000–250,000', id: '100k_250k', min: 100001, max: 250000 },
  { label: 'UGX 250,000–500,000', id: '250k_500k', min: 250001, max: 500000 },
  { label: 'Above UGX 500,000', id: 'above_500k', min: 500001, max: Infinity }
];

export const genderOptions = [
  'Women', 'Men', 'Unisex'
];

export const occasionOptions = [
  'Everyday', 'Wedding', 'Engagement', 'Birthday', 'Anniversary', "Valentine's", 'Graduation', 'Party', 'Gift'
];

export default function FilterSidebar({
  activeCategory,
  activeSubcategory,
  onSelectSubcategory,
  filters,
  onFilterChange,
  onResetFilters
}) {
  const activeSubcats = subcategories.filter(sub => sub.categoryId === activeCategory);

  const handleCheckboxChange = (group, value) => {
    const currentValues = filters[group] || [];
    let newValues;
    
    if (currentValues.includes(value)) {
      newValues = currentValues.filter(v => v !== value);
    } else {
      newValues = [...currentValues, value];
    }
    
    onFilterChange(group, newValues);
  };

  return (
    <aside className="shop-sidebar">
      {/* Header and Reset */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border-gold)', paddingBottom: '0.8rem' }}>
        <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Filter size={16} /> Filters
        </h3>
        <button 
          onClick={onResetFilters}
          style={{ background: 'none', border: 'none', color: 'var(--color-gold-dark)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Category Subcategories (if a category is active) */}
      {activeCategory && activeSubcats.length > 0 && (
        <div className="filter-section">
          <h4 className="filter-title">Subcategory</h4>
          <div className="filter-options">
            <button
              onClick={() => onSelectSubcategory(null)}
              style={{
                textAlign: 'left',
                padding: '0.35rem 0.5rem',
                background: !activeSubcategory ? 'var(--color-gold-accent)' : 'none',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.85rem',
                fontWeight: !activeSubcategory ? 700 : 500,
                color: !activeSubcategory ? 'var(--color-brown-primary)' : 'var(--color-text-secondary)',
                cursor: 'pointer'
              }}
            >
              All {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
            </button>
            {activeSubcats.map(sub => (
              <button
                key={sub.id}
                onClick={() => onSelectSubcategory(sub.id)}
                style={{
                  textAlign: 'left',
                  padding: '0.35rem 0.5rem',
                  background: activeSubcategory === sub.id ? 'var(--color-gold-accent)' : 'none',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  fontWeight: activeSubcategory === sub.id ? 700 : 500,
                  color: activeSubcategory === sub.id ? 'var(--color-brown-primary)' : 'var(--color-text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Material Filter */}
      <div className="filter-section">
        <h4 className="filter-title">Material</h4>
        <div className="filter-options">
          {materialOptions.map(mat => (
            <label key={mat} className="filter-label">
              <input 
                type="checkbox" 
                className="filter-checkbox"
                checked={(filters.material || []).includes(mat)}
                onChange={() => handleCheckboxChange('material', mat)}
              />
              {mat}
            </label>
          ))}
        </div>
      </div>

      {/* Color Filter */}
      <div className="filter-section">
        <h4 className="filter-title">Color</h4>
        <div className="filter-options">
          {colorOptions.map(color => (
            <label key={color} className="filter-label">
              <input 
                type="checkbox" 
                className="filter-checkbox"
                checked={(filters.color || []).includes(color)}
                onChange={() => handleCheckboxChange('color', color)}
              />
              {color}
            </label>
          ))}
        </div>
      </div>

      {/* Price Ranges Filter */}
      <div className="filter-section">
        <h4 className="filter-title">Price Range</h4>
        <div className="filter-options">
          {priceRanges.map(range => (
            <label key={range.id} className="filter-label">
              <input 
                type="checkbox" 
                className="filter-checkbox"
                checked={(filters.priceRanges || []).includes(range.id)}
                onChange={() => handleCheckboxChange('priceRanges', range.id)}
              />
              {range.label}
            </label>
          ))}
        </div>
      </div>

      {/* Gender Filter */}
      <div className="filter-section">
        <h4 className="filter-title">Gender</h4>
        <div className="filter-options">
          {genderOptions.map(gender => (
            <label key={gender} className="filter-label">
              <input 
                type="checkbox" 
                className="filter-checkbox"
                checked={(filters.gender || []).includes(gender)}
                onChange={() => handleCheckboxChange('gender', gender)}
              />
              {gender}
            </label>
          ))}
        </div>
      </div>

      {/* Occasion Filter */}
      <div className="filter-section">
        <h4 className="filter-title">Occasion</h4>
        <div className="filter-options">
          {occasionOptions.map(occ => (
            <label key={occ} className="filter-label">
              <input 
                type="checkbox" 
                className="filter-checkbox"
                checked={(filters.occasion || []).includes(occ)}
                onChange={() => handleCheckboxChange('occasion', occ)}
              />
              {occ}
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
