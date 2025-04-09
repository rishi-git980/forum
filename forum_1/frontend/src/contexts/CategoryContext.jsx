import React, { createContext, useContext, useState, useEffect } from 'react';

const CategoryContext = createContext();

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          console.log('Fetched categories:', data.data);
          setCategories(data.data);
        } else {
          throw new Error('Invalid categories data format');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getCategoryById = (categoryId) => {
    return categories.find(cat => cat._id === categoryId) || null;
  };

  const getCategoryName = (categoryId) => {
    const category = getCategoryById(categoryId);
    return category ? category.name : 'Uncategorized';
  };

  return (
    <CategoryContext.Provider value={{ 
      categories, 
      loading, 
      error, 
      getCategoryById,
      getCategoryName
    }}>
      {children}
    </CategoryContext.Provider>
  );
};

export default CategoryProvider; 