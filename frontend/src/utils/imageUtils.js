/**
 * Utility functions for product image handling
 */

/**
 * Get product image URL based on SKU and category
 * @param {string} sku - Product SKU
 * @param {string} category - Product category (men/women)
 * @param {string} imageUrl - Optional imageUrl from backend
 * @returns {string} Image URL path
 */
export const getProductImageUrl = (sku, category, imageUrl) => {
  // If imageUrl is provided from backend, use it (handle both absolute and relative paths)
  if (imageUrl) {
    // If it starts with /product, it's already a relative path
    if (imageUrl.startsWith('/product')) {
      return imageUrl;
    }
    // If it's a full URL, return as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    // Otherwise, assume it's a relative path
    return imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  }

  // Otherwise, try to construct path from SKU and category
  const categoryLower = category?.toLowerCase() || 'men';
  const categoryFolder = categoryLower === 'women' ? 'women' : 'men';
  
  // Try to find image by SKU
  // If SKU matches image filename pattern (e.g., "10054" -> "10054.jpg")
  const imagePath = `/product/${categoryFolder}/${sku}.jpg`;
  
  return imagePath;
};

/**
 * Get default product image if image not found
 * @returns {string} Default image placeholder
 */
export const getDefaultProductImage = () => {
  return '/product/default.jpg';
};

/**
 * Generate product description if not provided
 * @param {Object} product - Product object
 * @returns {string} Generated description
 */
export const generateProductDescription = (product) => {
  if (product.description) {
    return product.description;
  }

  const category = product.category?.toLowerCase() || 'product';
  const categoryName = category === 'women' ? "Women's" : category === 'men' ? "Men's" : category;
  
  return `Premium ${categoryName} ${product.productName || 'Product'}. High quality, stylish design perfect for everyday wear.`;
};
