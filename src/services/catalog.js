import { api } from './api';

let categoryNames = new Map();
let categoryIdsByName = new Map();
let categoryRequest;

export function getCategories(options) {
  return api.get('/categories/', options).then((response) => {
    const rows = Array.isArray(response) ? response : response?.results || [];
    const categories = rows.map((category) => ({
      ...category,
      image_url: category.image_url || category.image || '',
    }));
    categoryNames = new Map(categories.map((category) => [String(category.id), category.name]));
    categoryIdsByName = new Map(categories.map((category) => [String(category.name).toLowerCase(), category.id]));
    return categories;
  });
}

async function loadCategoryNames(options) {
  if (categoryNames.size) return;
  if (!categoryRequest) {
    categoryRequest = getCategories(options).finally(() => {
      categoryRequest = null;
    });
  }
  await categoryRequest;
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
  return loadCategoryNames({ signal })
    .catch(() => undefined)
    .then(() => api.get('/products/', {
      params: {
        category: categoryIdsByName.get(String(category || '').toLowerCase()) ?? category,
        search,
        tag,
        sort_by: sortBy,
        limit,
        offset,
      },
      signal,
    }))
    .then((response) => {
      const products = response?.products || response?.results || [];
      return {
        ...response,
        products,
        total: response?.total ?? response?.count ?? products.length,
      };
    });
}

export function getProduct(productId, options) {
  return Promise.all([
    api.get(`/products/${encodeURIComponent(productId)}/`, options),
    loadCategoryNames(options).catch(() => undefined),
  ]).then(([product]) => product);
}

export function normalizeProduct(product) {
  const images = Array.isArray(product.images)
    ? product.images.map((image) => (typeof image === 'string' ? image : image?.url)).filter(Boolean)
    : product.image ? [product.image] : [];
  const stockQuantity = product.stockQuantity ?? product.stock_quantity ?? null;
  const tag = product.tag
    || (product.isBestSeller ? 'Bestseller' : product.isNew ? 'New arrival' : '');
  const categoryId = product.categoryId ?? product.category?.id ?? product.category;
  const category = product.category?.name
    || product.categoryName
    || categoryNames.get(String(categoryId))
    || (typeof product.category === 'string' && !/^\d+$/.test(product.category) ? product.category : '')
    || product.subCategory
    || '';

  return {
    ...product,
    category,
    categoryId,
    price: Number(product.price) || 0,
    originalPrice: product.originalPrice == null && product.original_price == null
      ? null
      : Number(product.originalPrice ?? product.original_price) || 0,
    rating: Number(product.rating) || 0,
    reviewCount: Number(product.reviewCount ?? product.reviewsCount ?? product.reviews_count) || 0,
    isBestSeller: Boolean(product.isBestSeller ?? product.is_best_seller)
      || Boolean(tag.toLowerCase().includes('bestseller')),
    isNew: Boolean(product.isNew ?? product.is_new) || Boolean(tag.toLowerCase().includes('new')),
    is_in_stock: product.isInStock ?? product.is_in_stock ?? (stockQuantity == null || Number(stockQuantity) > 0),
    stock_quantity: stockQuantity,
    created_at: product.createdAt ?? product.created_at,
    tag,
    image: images[0] || product.image || '',
    images,
  };
}
