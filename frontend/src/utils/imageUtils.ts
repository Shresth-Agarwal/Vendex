export const getProductImageUrl = (imageUrl?: string, category?: string): string => {
  if (imageUrl) {
    return imageUrl.startsWith('http') ? imageUrl : `/product/${imageUrl}`;
  }
  
  // Fallback to category-based images
  if (category) {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('men') || categoryLower === 'men') {
      return '/product/men/default.jpg';
    } else if (categoryLower.includes('women') || categoryLower === 'women') {
      return '/product/women/default.jpg';
    }
  }
  
  return '/product/default.jpg';
};
