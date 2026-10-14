import { api } from './api';

export function getCategories(options) {
  return api.get('/categories', options);
}

export function getProducts({
  category,
  search,
  tag,
  sortBy = 'popular',
  limit = 24,
  offset = 0,
  signal,
} = {}) {
  return api.get('/products', {
    params: { category, search, tag, sort_by: sortBy, limit, offset },
    signal,
  });
}

export function getProduct(productId, options) {
  return api.get(`/products/${productId}`, options);
}

export function normalizeProduct(product) {
  return {
    ...product,
    originalPrice: product.original_price,
    reviewCount: product.reviews_count,
    isBestSeller: product.tag?.toLowerCase().includes('bestseller') || false,
    isNew: product.tag?.toLowerCase().includes('new') || false,
    images: product.image ? [product.image] : [],
  };
}
