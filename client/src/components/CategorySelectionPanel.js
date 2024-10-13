import React, { useState } from 'react';

function CategorySelectionPanel({ categories, selectedCategory, setSelectedCategory, setSelectedSubcategory }) {
  const [internalSelectedCategory, setInternalSelectedCategory] = useState('');

  const handleCategoryClick = (category) => {
    setInternalSelectedCategory(category);
  };

  const handleSubcategoryClick = (subcategory) => {
    setSelectedCategory(internalSelectedCategory);
    setSelectedSubcategory(subcategory);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1 p-1">
      {internalSelectedCategory ? (
        <>
          <button
            className="col-span-full p-2 mb-4 bg-slate-400 text-gray-700 rounded-lg shadow-md hover:bg-slate-300 transition duration-300 ease-in-out"
            onClick={() => setInternalSelectedCategory('')}
          >
            Back to Categories
          </button>
          {categories[internalSelectedCategory].subcategories.map((subcategory) => (
            <div
              key={subcategory.name}
              className="aspect-square bg-white shadow-md rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 overflow-hidden relative"
              onClick={() => handleSubcategoryClick(subcategory.name)}
            >
              <img src={subcategory.image} alt={subcategory.name} className="w-full h-full object-cover" />
              <span className="absolute inset-0 flex items-center justify-center text-center font-semibold p-2 bg-black bg-opacity-50 text-white">{subcategory.name}</span>
            </div>
          ))}
        </>
      ) : (
        Object.entries(categories).map(([category, categoryData]) => (
          <div
            key={category}
            className="aspect-square bg-white shadow-md rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 overflow-hidden relative"
            onClick={() => handleCategoryClick(category)}
          >
            <img src={categoryData.image} alt={category} className="w-full h-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center text-center font-semibold p-2 bg-black bg-opacity-50 text-white">{category}</span>
          </div>
        ))
      )}
    </div>
  );
}

export default CategorySelectionPanel;