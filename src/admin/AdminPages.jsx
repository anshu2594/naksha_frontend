import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BadgePercent,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ImagePlus,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import {
  createAdminCategory,
  createAdminOffer,
  createAdminProduct,
  deleteAdminCategory,
  deleteAdminOffer,
  deleteAdminProduct,
  deleteAdminProductImage,
  getAdminCategories,
  getAdminCustomers,
  getAdminOffers,
  getAdminOrders,
  getAdminOrder,
  getAdminProductImages,
  getAdminProducts,
  refundAdminOrder,
  updateAdminCategory,
  updateAdminOffer,
  updateAdminOrderStatus,
  updateAdminProduct,
  uploadAdminProductImages,
} from '../services/admin';
import { formatCurrency } from '../utils/formatCurrency';

const PAGE_SIZE = 20;
const inputClass = 'w-full rounded-xl border border-brand-nude bg-white px-3.5 py-2.5 text-sm text-brand-charcoal outline-none transition placeholder:text-brand-subtle/60 focus:border-brand-roseGold focus:ring-2 focus:ring-brand-blush/40';
const labelClass = 'block space-y-1.5 text-xs font-semibold text-brand-charcoal';

function formatAmount(value) {
  const amount = Number(value ?? 0);
  return formatCurrency(Number.isFinite(amount) ? amount : 0);
}

function formatDateTime(date) {
  if (!date) return '—';
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? '—'
    : parsed.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

function unwrapList(data) {
  if (Array.isArray(data)) return { results: data, count: data.length };
  return { results: Array.isArray(data?.results) ? data.results : [], count: Number(data?.count || 0) };
}

function useAdminList(load, params) {
  const [state, setState] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const query = JSON.stringify(params);
  const requestKey = `${query}:${reloadKey}`;

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    load({ ...JSON.parse(query), signal: controller.signal })
      .then((response) => {
        if (!controller.signal.aborted) {
          setState({ requestKey, data: unwrapList(response), error: '', status: 'success' });
        }
      })
      .catch((requestError) => {
        if (!controller.signal.aborted && requestError.name !== 'AbortError') {
          setState({ requestKey, data: { results: [], count: 0 }, error: requestError.message, status: 'error' });
        }
      });
    return () => controller.abort();
  }, [load, query, requestKey]);

  const isCurrent = state?.requestKey === requestKey;
  return {
    ...(isCurrent ? state.data : { results: [], count: 0 }),
    isLoading: !isCurrent || state.status === 'loading',
    error: isCurrent ? state.error : '',
    reload,
  };
}

function useRemoteValue(load, params = {}) {
  const [state, setState] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const query = JSON.stringify(params);
  const requestKey = `${query}:${reloadKey}`;
  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    load({ ...JSON.parse(query), signal: controller.signal })
      .then((result) => {
        if (!controller.signal.aborted) {
          setState({ requestKey, value: result, error: '', status: 'success' });
        }
      })
      .catch((requestError) => {
        if (!controller.signal.aborted && requestError.name !== 'AbortError') {
          setState({ requestKey, value: null, error: requestError.message, status: 'error' });
        }
      });
    return () => controller.abort();
  }, [load, query, requestKey]);

  const isCurrent = state?.requestKey === requestKey;
  return {
    value: isCurrent ? state.value : null,
    isLoading: !isCurrent || state.status === 'loading',
    error: isCurrent ? state.error : '',
    reload,
  };
}

function ErrorBanner({ error, onRetry }) {
  if (!error) return null;
  return (
    <div role="alert" className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between">
      <span>{error}</span>
      {onRetry && (
        <button type="button" onClick={onRetry} className="inline-flex shrink-0 items-center gap-2 font-semibold hover:underline">
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </button>
      )}
    </div>
  );
}

function TableFrame({ columns, children, isLoading, error, emptyText, onRetry, count, page, onPageChange }) {
  const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE));
  return (
    <section className="overflow-hidden rounded-2xl border border-brand-nude bg-white shadow-soft">
      <ErrorBanner error={error} onRetry={onRetry} />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-brand-nude/70 bg-brand-cream/60">
              {columns.map((column) => (
                <th key={column} scope="col" className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-subtle">{column}</th>
              ))}
            </tr>
          </thead>
          {isLoading ? (
            <tbody><tr><td colSpan={columns.length} className="px-5 py-16 text-center text-sm text-brand-subtle">
              <span role="status">Loading store records…</span>
            </td></tr></tbody>
          ) : children?.length ? (
            <tbody className="divide-y divide-brand-nude/50">{children}</tbody>
          ) : (
            <tbody><tr><td colSpan={columns.length} className="px-5 py-16 text-center text-sm text-brand-subtle">{emptyText}</td></tr></tbody>
          )}
        </table>
      </div>
      {!isLoading && count > 0 && (
        <div className="flex items-center justify-between border-t border-brand-nude/70 px-4 py-3 text-xs text-brand-subtle sm:px-5">
          <span>{Math.min((page - 1) * PAGE_SIZE + 1, count)}–{Math.min(page * PAGE_SIZE, count)} of {count}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              aria-label="Previous page"
              className="rounded-lg border border-brand-nude p-2 hover:bg-brand-cream disabled:cursor-not-allowed disabled:opacity-40"
            ><ChevronLeft className="h-4 w-4" /></button>
            <span>Page {page} of {pageCount}</span>
            <button
              type="button"
              disabled={page >= pageCount}
              onClick={() => onPageChange(page + 1)}
              aria-label="Next page"
              className="rounded-lg border border-brand-nude p-2 hover:bg-brand-cream disabled:cursor-not-allowed disabled:opacity-40"
            ><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </section>
  );
}

function SearchBar({ value, onChange, placeholder = 'Search records' }) {
  return (
    <label className="flex h-10 min-w-0 items-center gap-2 rounded-xl border border-brand-nude bg-white px-3 text-brand-subtle sm:max-w-sm sm:flex-1">
      <Search className="h-4 w-4 shrink-0" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-brand-subtle/70"
      />
    </label>
  );
}

function Toolbar({ search, onAdd, addLabel, children }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row">
        {search && <SearchBar value={search.value} onChange={search.onChange} placeholder={search.placeholder} />}
        {children}
      </div>
      {onAdd && (
        <Button onClick={onAdd} className="shrink-0">
          <Plus className="h-4 w-4" /> {addLabel}
        </Button>
      )}
    </div>
  );
}

function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-brand-charcoal/40 p-4" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`my-auto w-full ${wide ? 'max-w-3xl' : 'max-w-xl'} rounded-2xl border border-brand-nude bg-white shadow-elevated`}>
        <div className="flex items-center justify-between border-b border-brand-nude/70 px-5 py-4 sm:px-6">
          <h2 className="font-serif text-xl font-semibold text-brand-charcoal">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-brand-subtle hover:bg-brand-cream">×</button>
        </div>
        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

function ResourceForm({ title, fields, initialValues, onClose, onSave }) {
  const [values, setValues] = useState(() => ({ ...initialValues }));
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      const payload = {};
      for (const field of fields) {
        const value = values[field.name];
        const payloadName = field.payloadName || field.name;
        if (field.type === 'number') {
          payload[payloadName] = value === '' && field.allowNull ? null : Number(value);
        } else if (field.type === 'checkbox') {
          payload[payloadName] = Boolean(value);
        } else if (field.type === 'datetime-local') {
          payload[payloadName] = value ? new Date(value).toISOString() : '';
        } else if (field.type === 'select' && field.castNumber) {
          payload[payloadName] = value === '' ? null : Number(value);
        } else if (field.parseJson) {
          try {
            payload[payloadName] = JSON.parse(value || '[]');
          } catch {
            throw new Error(`${field.label} must be valid JSON.`);
          }
        } else {
          payload[payloadName] = typeof value === 'string' ? value.trim() : value;
        }
      }
      await onSave(payload);
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal title={title} onClose={onClose} wide={fields.length > 8}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <label key={field.name} className={`${labelClass} ${field.fullWidth ? 'sm:col-span-2' : ''}`}>
              {field.label}
              {field.type === 'checkbox' ? (
                <span className="flex min-h-11 items-center gap-2 rounded-xl border border-brand-nude px-3.5">
                  <input
                    type="checkbox"
                    checked={Boolean(values[field.name])}
                    onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.checked }))}
                    className="h-4 w-4 accent-[#C06C64]"
                  />
                  <span className="text-sm font-normal text-brand-subtle">{field.help || 'Enabled'}</span>
                </span>
              ) : field.type === 'select' ? (
                <select
                  className={inputClass}
                  required={field.required}
                  value={values[field.name] ?? ''}
                  onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                >
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  className={`${inputClass} min-h-24 resize-y`}
                  required={field.required}
                  maxLength={field.maxLength}
                  value={values[field.name] ?? ''}
                  onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  className={inputClass}
                  required={field.required}
                  min={field.min}
                  step={field.step}
                  maxLength={field.maxLength}
                  placeholder={field.placeholder}
                  value={values[field.name] ?? ''}
                  onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                />
              )}
              {field.help && field.type !== 'checkbox' && <span className="block text-[11px] font-normal text-brand-subtle">{field.help}</span>}
            </label>
          ))}
        </div>
        {error && <ErrorBanner error={error} />}
        <div className="flex justify-end gap-2 border-t border-brand-nude/70 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isSaving}>Save changes</Button>
        </div>
      </form>
    </Modal>
  );
}

function ConfirmDelete({ title, description, onClose, onConfirm }) {
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const confirm = async () => {
    setIsDeleting(true);
    setError('');
    try {
      await onConfirm();
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <Modal title={title} onClose={onClose}>
      <p className="text-sm leading-6 text-brand-subtle">{description}</p>
      {error && <div className="mt-4"><ErrorBanner error={error} /></div>}
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Keep</Button>
        <Button variant="primary" onClick={confirm} isLoading={isDeleting} className="!bg-rose-700 hover:!bg-rose-800">Delete</Button>
      </div>
    </Modal>
  );
}

function StatusBadge({ status }) {
  const normalized = String(status || 'unknown').toLowerCase();
  const variant = ['paid', 'delivered', 'active', 'captured', 'completed'].includes(normalized)
    ? 'bg-emerald-50 text-emerald-800'
    : ['cancelled', 'failed', 'inactive', 'refunded'].includes(normalized)
      ? 'bg-rose-50 text-rose-800'
      : 'bg-amber-50 text-amber-900';
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${variant}`}>{status || 'Unknown'}</span>;
}

function formatDate(date) {
  if (!date) return '—';
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleString('en-IN', { dateStyle: 'medium' });
}

function toSlug(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [editor, setEditor] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [imageEditor, setImageEditor] = useState(null);
  const [mutationError, setMutationError] = useState('');
  const { results, count, isLoading, error, reload } = useAdminList(getAdminProducts, {
    search: query,
    category: categoryFilter,
    active: activeFilter,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });
  const categoryList = useRemoteValue(getAdminCategories, { limit: 100, offset: 0 });
  const categories = unwrapList(categoryList.value || []).results;

  const startSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setQuery(searchInput.trim().toLowerCase());
  };
  const handleDelete = async () => {
    await deleteAdminProduct(deleting.id);
    setDeleting(null);
    reload();
  };

  const openEdit = (product) => setEditor({
    ...product,
    colorsText: JSON.stringify(product.colors || [], null, 2),
    availableSizesText: JSON.stringify(product.availableSizes || [], null, 2),
    availableCupsText: JSON.stringify(product.availableCups || [], null, 2),
    featuresText: JSON.stringify(product.features || [], null, 2),
    categoryId: product.categoryId ?? product.category_id ?? product.category?.id ?? '',
    slug: product.slug || '',
    subCategory: product.subCategory || '',
    originalPrice: product.originalPrice ?? product.original_price ?? '',
    stockQuantity: product.stockQuantity ?? '',
    sortOrder: product.sortOrder ?? 0,
    isFeatured: Boolean(product.isFeatured ?? product.is_featured),
    isBestSeller: Boolean(product.isBestSeller ?? product.is_best_seller),
    isNew: Boolean(product.isNew ?? product.is_new),
    isActive: product.isActive ?? product.is_active ?? true,
  });

  const saveProduct = async (payload) => {
    setMutationError('');
    try {
      const product = { ...payload, slug: payload.slug || toSlug(payload.name) };
      if (!product.sku) delete product.sku;
      if (editor?.id) await updateAdminProduct(editor.id, product);
      else await createAdminProduct(product);
      setEditor(null);
      reload();
    } catch (requestError) {
      setMutationError(requestError.message);
      throw requestError;
    }
  };

  return (
    <>
      <Toolbar
        search={{ value: searchInput, onChange: setSearchInput, placeholder: 'Search products' }}
        onAdd={() => setEditor({ name: '', slug: '', categoryId: '', subCategory: '', description: '', price: '', originalPrice: '', sku: '', stockQuantity: '0', colorsText: '[]', availableSizesText: '[]', availableCupsText: '[]', featuresText: '[]', isFeatured: false, isBestSeller: false, isNew: false, isActive: true, sortOrder: 0 })}
        addLabel="Add product"
      >
        <form onSubmit={startSearch}><button className="h-10 rounded-xl border border-brand-nude bg-white px-4 text-sm font-semibold text-brand-charcoal hover:bg-brand-cream">Search</button></form>
        <select aria-label="Filter products by category" value={categoryFilter} onChange={(event) => { setPage(1); setCategoryFilter(event.target.value); }} className="h-10 rounded-xl border border-brand-nude bg-white px-3 text-sm">
          <option value="">All categories</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        <select aria-label="Filter product visibility" value={activeFilter} onChange={(event) => { setPage(1); setActiveFilter(event.target.value); }} className="h-10 rounded-xl border border-brand-nude bg-white px-3 text-sm">
          <option value="">All visibility</option>
          <option value="true">Active</option>
          <option value="false">Hidden</option>
        </select>
      </Toolbar>
      {mutationError && <div className="mb-4"><ErrorBanner error={mutationError} /></div>}
      <TableFrame
        columns={['Product', 'SKU', 'Category', 'Price', 'Stock', 'Visibility', 'Actions']}
        isLoading={isLoading || categoryList.isLoading}
        error={error || categoryList.error}
        onRetry={() => { reload(); categoryList.reload(); }}
        emptyText={query || categoryFilter || activeFilter ? 'No products match these filters.' : 'No products are in the catalog yet.'}
        count={count}
        page={page}
        onPageChange={setPage}
      >
        {results.map((product) => (
          <tr key={product.id} className="hover:bg-brand-cream/40">
            <td className="px-5 py-3">
              <div className="flex items-center gap-3">
                {(product.images?.[0]?.url || product.images?.[0] || product.image) ? <img src={product.images?.[0]?.url || product.images?.[0] || product.image} alt="" className="h-11 w-10 rounded-lg border border-brand-nude object-cover" /> : <div className="flex h-11 w-10 items-center justify-center rounded-lg bg-brand-cream text-brand-subtle"><Package className="h-4 w-4" /></div>}
                <div><p className="max-w-48 truncate text-sm font-semibold">{product.name}</p><p className="text-xs text-brand-subtle">{product.slug || '—'}</p></div>
              </div>
            </td>
            <td className="px-5 py-3 text-sm">{product.sku || '—'}</td>
            <td className="px-5 py-3 text-sm">{categories.find((category) => String(category.id) === String(product.categoryId))?.name || product.category?.name || product.category || '—'}</td>
            <td className="px-5 py-3 text-sm font-semibold">{formatAmount(product.price)}</td>
            <td className="px-5 py-3 text-sm">{product.stockQuantity ?? 'Untracked'}</td>
            <td className="px-5 py-3"><StatusBadge status={(product.isActive ?? product.is_active) ? 'Active' : 'Hidden'} /></td>
            <td className="px-5 py-3">
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => openEdit(product)} aria-label={`Edit ${product.name}`} className="rounded-lg p-2 text-brand-subtle hover:bg-brand-cream hover:text-brand-charcoal"><Pencil className="h-4 w-4" /></button>
                <button type="button" onClick={() => setImageEditor(product)} aria-label={`Manage images for ${product.name}`} className="rounded-lg p-2 text-brand-subtle hover:bg-brand-cream hover:text-brand-charcoal"><ImagePlus className="h-4 w-4" /></button>
                <button type="button" onClick={() => setDeleting(product)} aria-label={`Delete ${product.name}`} className="rounded-lg p-2 text-rose-700 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            </td>
          </tr>
        ))}
      </TableFrame>
      {editor && (
        <ResourceForm
          title={editor.id ? 'Edit product' : 'Add product'}
          initialValues={editor}
          onClose={() => setEditor(null)}
          onSave={saveProduct}
          fields={[
            { name: 'name', label: 'Product name', required: true },
            { name: 'slug', label: 'Slug', help: 'Leave blank to let the backend generate it.' },
            { name: 'sku', label: 'SKU', help: 'Leave blank to let the backend generate it.' },
            { name: 'categoryId', label: 'Category', type: 'select', required: true, castNumber: true, options: [{ value: '', label: 'Select category' }, ...categories.map((category) => ({ value: category.id, label: category.name }))] },
            { name: 'subCategory', label: 'Subcategory' },
            { name: 'price', label: 'Selling price (INR)', type: 'number', required: true, min: 0, step: '0.01' },
            { name: 'originalPrice', label: 'Original price (INR)', type: 'number', min: 0, step: '0.01', allowNull: true },
            { name: 'stockQuantity', label: 'Stock quantity', type: 'number', min: 0, step: 1, allowNull: true, help: 'Leave blank for legacy/untracked inventory.' },
            { name: 'sortOrder', label: 'Sort order', type: 'number', min: 0, step: 1 },
            { name: 'padding', label: 'Padding' },
            { name: 'wire', label: 'Underwire' },
            { name: 'fabric', label: 'Fabric' },
            { name: 'coverage', label: 'Coverage' },
            { name: 'straps', label: 'Straps' },
            { name: 'neckline', label: 'Neckline' },
            { name: 'backDesign', label: 'Back design' },
            { name: 'sleeveLength', label: 'Sleeve length' },
            { name: 'closure', label: 'Closure' },
            { name: 'alterationMargin', label: 'Alteration margin', type: 'number', min: 0, step: '0.01', allowNull: true },
            { name: 'colorsText', payloadName: 'colors', label: 'Colors (JSON)', type: 'textarea', parseJson: true, fullWidth: true },
            { name: 'availableSizesText', payloadName: 'availableSizes', label: 'Available sizes (JSON)', type: 'textarea', parseJson: true, fullWidth: true },
            { name: 'availableCupsText', payloadName: 'availableCups', label: 'Available cups (JSON)', type: 'textarea', parseJson: true, fullWidth: true },
            { name: 'featuresText', payloadName: 'features', label: 'Features (JSON)', type: 'textarea', parseJson: true, fullWidth: true },
            { name: 'description', label: 'Description', type: 'textarea', fullWidth: true, required: true },
            { name: 'isFeatured', label: 'Featured product', type: 'checkbox' },
            { name: 'isBestSeller', label: 'Best seller', type: 'checkbox' },
            { name: 'isNew', label: 'New arrival', type: 'checkbox' },
            { name: 'isActive', label: 'Active', type: 'checkbox' },
          ]}
        />
      )}
      {deleting && (
        <ConfirmDelete title="Delete product?" description={`“${deleting.name}” will be removed from the product catalog.`} onClose={() => setDeleting(null)} onConfirm={handleDelete} />
      )}
      {imageEditor && <ProductImageManager product={imageEditor} onClose={() => setImageEditor(null)} />}
    </>
  );
}

function ProductImageManager({ product, onClose }) {
  const images = useRemoteValue(loadProductImages, { productId: product.id });
  const imageRows = unwrapList(images.value || []).results;
  const [files, setFiles] = useState([]);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [altText, setAltText] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const upload = async (event) => {
    event.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      await uploadAdminProductImages(product.id, files, { altText });
      setFiles([]);
      setFileInputKey((key) => key + 1);
      images.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };
  const remove = async (imageId) => {
    setError('');
    try {
      await deleteAdminProductImage(product.id, imageId);
      images.reload();
    } catch (requestError) {
      setError(requestError.message);
    }
  };
  return (
    <Modal title={`Images · ${product.name}`} onClose={onClose}>
      <form onSubmit={upload} className="space-y-3 rounded-xl border border-brand-nude bg-brand-cream/40 p-4">
        <label className={labelClass}>Product images (JPEG, PNG, WebP; max 5 MB each)
          <input
            type="file"
            key={fileInputKey}
            accept="image/jpeg,image/png,image/webp"
            multiple
            required
            onChange={(event) => {
              const selected = Array.from(event.target.files || []);
              setFiles(selected.filter((file) => file.size <= 5 * 1024 * 1024));
              if (selected.some((file) => file.size > 5 * 1024 * 1024)) setError('Each image must be 5 MB or smaller.');
            }}
            className="block w-full text-sm font-normal file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:text-xs file:font-semibold"
          />
        </label>
        <label className={labelClass}>Shared alt text
          <input value={altText} onChange={(event) => setAltText(event.target.value)} className={inputClass} maxLength={255} />
        </label>
        {error && <ErrorBanner error={error} />}
        <Button type="submit" isLoading={isSaving} disabled={!files.length}>Upload selected images</Button>
      </form>
      <div className="mt-5 space-y-3">
        <h3 className="text-sm font-semibold">Current images</h3>
        {images.isLoading ? <p role="status" className="text-sm text-brand-subtle">Loading images…</p>
          : images.error ? <ErrorBanner error={images.error} onRetry={images.reload} />
            : imageRows.length ? imageRows.map((image) => (
              <div key={image.id} className="flex items-center gap-3 rounded-xl border border-brand-nude p-2.5">
                <img src={image.url || image.image} alt={image.altText || image.alt_text || ''} className="h-14 w-14 rounded-lg object-cover" />
                <p className="min-w-0 flex-1 truncate text-xs text-brand-subtle">{image.altText || image.alt_text || 'Product image'}</p>
                <button type="button" onClick={() => remove(image.id)} aria-label="Delete image" className="rounded-lg p-2 text-rose-700 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            )) : <p className="text-sm text-brand-subtle">No images uploaded for this product.</p>}
      </div>
    </Modal>
  );
}

function AdminCategoriesPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [editor, setEditor] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const list = useAdminList(getAdminCategories, { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });
  const visible = query ? list.results.filter((category) => `${category.name} ${category.slug}`.toLowerCase().includes(query)) : list.results;
  const onSave = async (payload) => {
    setError('');
    try {
      if (editor?.id) await updateAdminCategory(editor.id, payload);
      else await createAdminCategory(payload);
      setEditor(null);
      list.reload();
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    }
  };
  return (
    <>
      <Toolbar search={{ value: searchInput, onChange: setSearchInput, placeholder: 'Search current categories' }} onAdd={() => setEditor({ name: '', slug: '', description: '', image: '', subcategories: [], sortOrder: 0, isActive: true })} addLabel="Add category">
        <button type="button" onClick={() => { setPage(1); setQuery(searchInput.trim().toLowerCase()); }} className="h-10 rounded-xl border border-brand-nude bg-white px-4 text-sm font-semibold hover:bg-brand-cream">Search</button>
      </Toolbar>
      {error && <div className="mb-4"><ErrorBanner error={error} /></div>}
      <TableFrame columns={['Category', 'Slug', 'Subcategories', 'Sort order', 'Visibility', 'Actions']} isLoading={list.isLoading} error={list.error} onRetry={list.reload} emptyText="No categories are configured yet." count={list.count} page={page} onPageChange={setPage}>
        {visible.map((category) => (
          <tr key={category.id}>
            <td className="px-5 py-3"><p className="text-sm font-semibold">{category.name}</p><p className="max-w-xs truncate text-xs text-brand-subtle">{category.description || '—'}</p></td>
            <td className="px-5 py-3 text-sm">{category.slug}</td>
            <td className="px-5 py-3 text-sm">{Array.isArray(category.subcategories) ? category.subcategories.length : 0}</td>
            <td className="px-5 py-3 text-sm">{category.sortOrder ?? 0}</td>
            <td className="px-5 py-3"><StatusBadge status={category.isActive ? 'Active' : 'Hidden'} /></td>
            <td className="px-5 py-3"><div className="flex gap-1">
              <button type="button" onClick={() => setEditor({ ...category })} aria-label={`Edit ${category.name}`} className="rounded-lg p-2 text-brand-subtle hover:bg-brand-cream"><Pencil className="h-4 w-4" /></button>
              <button type="button" onClick={() => setDeleting(category)} aria-label={`Delete ${category.name}`} className="rounded-lg p-2 text-rose-700 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
            </div></td>
          </tr>
        ))}
      </TableFrame>
      {editor && <ResourceForm title={editor.id ? 'Edit category' : 'Add category'} initialValues={{ ...editor, subcategoriesText: JSON.stringify(editor.subcategories || [], null, 2) }} onClose={() => setEditor(null)} onSave={onSave} fields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'slug', label: 'Slug', required: true },
        { name: 'image', label: 'Image URL' },
        { name: 'sortOrder', label: 'Sort order', type: 'number', min: 0, step: 1 },
        { name: 'description', label: 'Description', type: 'textarea', fullWidth: true },
        { name: 'isActive', label: 'Active', type: 'checkbox' },
        { name: 'subcategoriesText', payloadName: 'subcategories', label: 'Subcategories (JSON)', type: 'textarea', fullWidth: true, parseJson: true, help: 'Enter the subcategories array in the format accepted by the category API.' },
      ]} />}
      {deleting && <ConfirmDelete title="Delete category?" description={`“${deleting.name}” will be removed from the catalog.`} onClose={() => setDeleting(null)} onConfirm={async () => { await deleteAdminCategory(deleting.id); setDeleting(null); list.reload(); }} />}
    </>
  );
}

const initialOffer = {
  code: '',
  name: '',
  description: '',
  discountType: 'percent',
  discountValue: '',
  minimumOrderValue: 0,
  maximumDiscount: '',
  startsAt: '',
  endsAt: '',
  usageLimit: '',
  isActive: true,
};

function asLocalInput(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function AdminOffersPage() {
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [query, setQuery] = useState('');
  const list = useAdminList(getAdminOffers, { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });
  const onSave = async (payload) => {
    const start = Date.parse(payload.startsAt);
    const end = Date.parse(payload.endsAt);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      throw new Error('Choose a valid start and end time; the end must be later than the start.');
    }
    if (editor?.id) await updateAdminOffer(editor.id, payload);
    else await createAdminOffer(payload);
    setEditor(null);
    list.reload();
  };
  const filtered = query
    ? list.results.filter((offer) => `${offer.name} ${offer.code}`.toLowerCase().includes(query.toLowerCase()))
    : list.results;
  return (
    <>
      <Toolbar search={{ value: query, onChange: setQuery, placeholder: 'Filter current offers' }} onAdd={() => setEditor({ ...initialOffer })} addLabel="Create offer" />
      <TableFrame columns={['Offer', 'Code', 'Discount', 'Schedule', 'Usage', 'Status', 'Actions']} isLoading={list.isLoading} error={list.error} onRetry={list.reload} emptyText="No promotional offers have been created yet." count={list.count} page={page} onPageChange={setPage}>
        {filtered.map((offer) => {
          return (
            <tr key={offer.id}>
              <td className="px-5 py-3"><p className="text-sm font-semibold">{offer.name}</p><p className="max-w-48 truncate text-xs text-brand-subtle">{offer.description || '—'}</p></td>
              <td className="px-5 py-3"><code className="rounded bg-brand-cream px-2 py-1 text-xs">{offer.code}</code></td>
              <td className="px-5 py-3 text-sm font-semibold">{offer.discountType === 'percent' ? `${offer.discountValue}%` : formatAmount(offer.discountValue)}</td>
              <td className="px-5 py-3 text-xs text-brand-subtle"><span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{formatDateTime(offer.startsAt)} – {formatDateTime(offer.endsAt)}</span></td>
              <td className="px-5 py-3 text-sm">{offer.usageCount ?? 0}{offer.usageLimit ? ` / ${offer.usageLimit}` : ''}</td>
              <td className="px-5 py-3"><StatusBadge status={offer.isActive ? 'Enabled' : 'Disabled'} /></td>
              <td className="px-5 py-3"><div className="flex gap-1">
                <button type="button" onClick={() => setEditor({ ...offer, discountValue: offer.discountValue ?? '', minimumOrderValue: offer.minimumOrderValue ?? 0, maximumDiscount: offer.maximumDiscount ?? '', usageLimit: offer.usageLimit ?? '', startsAt: asLocalInput(offer.startsAt), endsAt: asLocalInput(offer.endsAt) })} aria-label={`Edit offer ${offer.code}`} className="rounded-lg p-2 text-brand-subtle hover:bg-brand-cream"><Pencil className="h-4 w-4" /></button>
                <button type="button" onClick={() => setDeleting(offer)} aria-label={`Delete offer ${offer.code}`} className="rounded-lg p-2 text-rose-700 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
              </div></td>
            </tr>
          );
        })}
      </TableFrame>
      {editor && <ResourceForm title={editor.id ? 'Edit offer' : 'Create offer'} initialValues={editor} onClose={() => setEditor(null)} onSave={onSave} fields={[
        { name: 'code', label: 'Coupon code', required: true, maxLength: 40 },
        { name: 'name', label: 'Offer name', required: true },
        { name: 'discountType', label: 'Discount type', type: 'select', required: true, options: [{ value: 'percent', label: 'Percentage' }, { value: 'fixed', label: 'Fixed amount' }] },
        { name: 'discountValue', label: 'Discount value', type: 'number', required: true, min: 0.01, step: '0.01' },
        { name: 'minimumOrderValue', label: 'Minimum order (INR)', type: 'number', min: 0, step: '0.01' },
        { name: 'maximumDiscount', label: 'Maximum discount (INR)', type: 'number', min: 0, step: '0.01', allowNull: true },
        { name: 'startsAt', label: 'Starts at (your local time)', type: 'datetime-local', required: true },
        { name: 'endsAt', label: 'Ends at (your local time)', type: 'datetime-local', required: true },
        { name: 'usageLimit', label: 'Usage limit', type: 'number', min: 1, step: 1, allowNull: true },
        { name: 'description', label: 'Description', type: 'textarea', fullWidth: true },
        { name: 'isActive', label: 'Active', type: 'checkbox' },
      ]} />}
      {deleting && <ConfirmDelete title="Delete offer?" description={`Coupon ${deleting.code} will no longer be available.`} onClose={() => setDeleting(null)} onConfirm={async () => { await deleteAdminOffer(deleting.id); setDeleting(null); list.reload(); }} />}
    </>
  );
}

function AdminCustomersPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const list = useAdminList(getAdminCustomers, { search: query, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });
  return (
    <>
      <Toolbar search={{ value: searchInput, onChange: setSearchInput, placeholder: 'Search name or phone' }}>
        <button type="button" onClick={() => { setPage(1); setQuery(searchInput.trim()); }} className="h-10 rounded-xl border border-brand-nude bg-white px-4 text-sm font-semibold hover:bg-brand-cream">Search</button>
      </Toolbar>
      <TableFrame columns={['Customer', 'Phone', 'Orders', 'Paid total', 'Latest order']} isLoading={list.isLoading} error={list.error} onRetry={list.reload} emptyText={query ? 'No customers match that search.' : 'No customer order records yet.'} count={list.count} page={page} onPageChange={setPage}>
        {list.results.map((customer, index) => (
          <tr key={customer.guestId || customer.id || index}>
            <td className="px-5 py-3"><p className="text-sm font-semibold">{customer.fullName || 'Guest customer'}</p><p className="text-[11px] text-brand-subtle">Guest ID: {customer.guestId || '—'}</p></td>
            <td className="px-5 py-3 text-sm">{customer.phone || '—'}</td>
            <td className="px-5 py-3 text-sm">{customer.orderCount ?? 0}</td>
            <td className="px-5 py-3 text-sm font-semibold">{formatAmount(customer.paidTotal ?? 0)}</td>
            <td className="px-5 py-3 text-sm text-brand-subtle">{formatDate(customer.latestOrderAt)}</td>
          </tr>
        ))}
      </TableFrame>
    </>
  );
}

function orderValue(order, camel, snake) {
  return order?.[camel] ?? order?.[snake];
}

function loadOrderDetails({ orderId, signal }) {
  return getAdminOrder(orderId, { signal });
}

function loadProductImages({ productId, signal }) {
  return getAdminProductImages(productId, { signal });
}

const statusTransitions = {
  PENDING: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

function OrderDetailModal({ order, onClose, onUpdated, paymentView = false }) {
  const detail = useRemoteValue(loadOrderDetails, { orderId: order.id });
  const orderData = detail.value ? { ...order, ...detail.value } : order;
  const [selectedStatus, setSelectedStatus] = useState(String(order.status || '').toUpperCase());
  const [note, setNote] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const refundIdempotency = useRef(null);
  const orderId = orderData.id;
  const currentStatus = String(orderData.status || '').toUpperCase();
  const paymentStatus = String(orderValue(orderData, 'paymentStatus', 'payment_status') || '').toLowerCase();
  const remaining = Number(orderValue(orderData, 'refundableAmount', 'refundable_amount') ?? orderValue(orderData, 'totalAmount', 'total_amount') ?? 0);
  const doUpdateStatus = async () => {
    setError('');
    setIsSaving(true);
    try {
      await updateAdminOrderStatus(orderId, selectedStatus, note.trim() || undefined);
      await onUpdated();
      detail.reload();
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };
  const doRefund = async () => {
    const amount = Number(refundAmount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > remaining) {
      setError(`Enter a refund amount greater than zero and no more than ${formatAmount(remaining)}.`);
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      const normalizedAmount = amount.toFixed(2);
      if (refundIdempotency.current?.amount !== normalizedAmount) {
        refundIdempotency.current = { amount: normalizedAmount, key: crypto.randomUUID() };
      }
      const refund = await refundAdminOrder(orderId, normalizedAmount, refundIdempotency.current.key);
      refundIdempotency.current = null;
      await onUpdated();
      detail.reload();
      setRefundAmount('');
      setNotice(`Refund request ${refund.id} is ${refund.status}. Final status is updated by the payment provider webhook.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };
  const items = orderData.items || [];
  return (
    <Modal title={`${paymentView ? 'Payment' : 'Order'} ${orderData.orderNumber || orderData.order_number || `#${orderData.id}`}`} onClose={onClose} wide>
      {detail.isLoading && <p role="status" className="mb-4 text-sm text-brand-subtle">Loading complete order details…</p>}
      {detail.error && <div className="mb-4"><ErrorBanner error={detail.error} onRetry={detail.reload} /></div>}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-3 rounded-xl bg-brand-cream/50 p-4 text-sm">
          <h3 className="font-semibold">Order details</h3>
          <p><span className="text-brand-subtle">Customer:</span> {orderData.shippingName || orderData.shipping_name || 'Guest'}</p>
          <p><span className="text-brand-subtle">Phone:</span> {orderData.shippingPhone || orderData.shipping_phone || '—'}</p>
          <p><span className="text-brand-subtle">Placed:</span> {formatDate(orderData.createdAt || orderData.created_at)}</p>
          <p><span className="text-brand-subtle">Payment:</span> <StatusBadge status={orderValue(orderData, 'paymentStatus', 'payment_status')} /></p>
          <p><span className="text-brand-subtle">Fulfillment:</span> <StatusBadge status={orderData.status} /></p>
          <p><span className="text-brand-subtle">Total:</span> <strong>{formatAmount(orderValue(orderData, 'totalAmount', 'total_amount') ?? orderData.total)}</strong></p>
          {orderData.couponCode && <p><span className="text-brand-subtle">Coupon:</span> {orderData.couponCode}</p>}
          {orderData.discountAmount > 0 && <p><span className="text-brand-subtle">Discount:</span> −{formatAmount(orderData.discountAmount)}</p>}
          <p><span className="text-brand-subtle">Address:</span> {orderData.shippingAddress || orderData.shipping_address || '—'}, {orderData.shippingCity || orderData.shipping_city || ''} {orderData.shippingState || orderData.shipping_state || ''} {orderData.shippingPincode || orderData.shipping_pincode || ''}</p>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-brand-nude p-4">
            <h3 className="mb-3 text-sm font-semibold">Update fulfillment status</h3>
            <label className={labelClass}>New status
              <select className={inputClass} value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
                <option value={currentStatus}>{currentStatus || 'Current status'}</option>
                {(statusTransitions[currentStatus] || []).map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
            {selectedStatus === 'CANCELLED' && paymentStatus === 'paid' && <p className="mt-2 text-xs text-rose-700">Refund the paid amount before cancelling this order.</p>}
            <label className={`${labelClass} mt-3`}>Staff note (optional)
              <input className={inputClass} value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} />
            </label>
            <Button className="mt-3" isLoading={isSaving} disabled={selectedStatus === currentStatus || (selectedStatus === 'CANCELLED' && paymentStatus === 'paid')} onClick={doUpdateStatus}>Save status</Button>
          </div>
          {paymentStatus === 'paid' && (
            <div className="rounded-xl border border-brand-nude p-4">
              <h3 className="text-sm font-semibold">Issue partial refund</h3>
              <p className="mt-1 text-xs text-brand-subtle">Remaining refundable amount: {formatAmount(remaining)}. Refund completion is confirmed by the payment webhook.</p>
              <label className={`${labelClass} mt-3`}>Refund amount (INR)
                <input type="number" min="0.01" max={remaining} step="0.01" value={refundAmount} onChange={(event) => setRefundAmount(event.target.value)} className={inputClass} />
              </label>
              <Button className="mt-3" isLoading={isSaving} disabled={!refundAmount} onClick={doRefund}>Request refund</Button>
            </div>
          )}
        </div>
      </div>
      {!!orderData.statusHistory?.length && (
        <div className="mt-5 rounded-xl border border-brand-nude p-4">
          <h3 className="text-sm font-semibold">Fulfillment history</h3>
          <div className="mt-3 space-y-3">
            {orderData.statusHistory.map((entry, index) => (
              <div key={entry.id || `${entry.status}-${index}`} className="flex gap-3 text-xs">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-roseGold" />
                <div>
                  <p className="font-semibold">{entry.status || entry.toStatus || entry.to_status || 'Status updated'} · {formatDateTime(entry.createdAt || entry.created_at)}</p>
                  {(entry.note || entry.changedBy || entry.changed_by) && <p className="mt-0.5 text-brand-subtle">{entry.note || ''}{entry.changedBy || entry.changed_by ? ` · ${entry.changedBy || entry.changed_by}` : ''}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {!!items.length && (
        <div className="mt-5 rounded-xl border border-brand-nude p-4">
          <h3 className="text-sm font-semibold">Items</h3>
          <div className="mt-3 divide-y divide-brand-nude/60">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 py-2 text-sm">
                <span>{item.productName || item.product_name || item.name} × {item.quantity}</span>
                <span className="font-semibold">{formatAmount(item.subtotal ?? item.price)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {notice && <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}
      {error && <div className="mt-4"><ErrorBanner error={error} /></div>}
    </Modal>
  );
}

function OrdersTable({ paymentView = false }) {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const list = useAdminList(getAdminOrders, {
    search: query,
    paymentStatus: paymentView ? filter : undefined,
    status: paymentView ? undefined : filter,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });
  const reloadSelected = async () => {
    list.reload();
  };
  return (
    <>
      <Toolbar search={{ value: searchInput, onChange: setSearchInput, placeholder: 'Search order or customer' }}>
        <button type="button" onClick={() => { setPage(1); setQuery(searchInput.trim()); }} className="h-10 rounded-xl border border-brand-nude bg-white px-4 text-sm font-semibold hover:bg-brand-cream">Search</button>
        <select aria-label={paymentView ? 'Filter payment status' : 'Filter order status'} value={filter} onChange={(event) => { setPage(1); setFilter(event.target.value); }} className="h-10 rounded-xl border border-brand-nude bg-white px-3 text-sm">
          <option value="">All {paymentView ? 'payments' : 'orders'}</option>
          {(paymentView ? ['pending', 'paid', 'failed', 'refunded'] : ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
      </Toolbar>
      <TableFrame columns={paymentView ? ['Order', 'Customer', 'Method', 'Payment status', 'Amount', ''] : ['Order', 'Customer', 'Placed', 'Fulfillment', 'Payment', 'Total', '']} isLoading={list.isLoading} error={list.error} onRetry={list.reload} emptyText={paymentView ? 'No payment records match these filters.' : 'No orders match these filters.'} count={list.count} page={page} onPageChange={setPage}>
        {list.results.map((order) => (
          <tr key={order.id} className="hover:bg-brand-cream/40">
            <td className="px-5 py-3 text-sm font-semibold">{order.orderNumber || order.order_number || `#${order.id}`}</td>
            <td className="px-5 py-3 text-sm">{order.shippingName || order.shipping_name || 'Guest'}</td>
            {!paymentView && <td className="px-5 py-3 text-sm text-brand-subtle">{formatDate(order.createdAt || order.created_at)}</td>}
            {paymentView && <td className="px-5 py-3 text-sm">{order.paymentMethod || order.payment_method || '—'}</td>}
            {!paymentView && <td className="px-5 py-3"><StatusBadge status={order.status} /></td>}
            <td className="px-5 py-3"><StatusBadge status={orderValue(order, 'paymentStatus', 'payment_status')} /></td>
            <td className="px-5 py-3 text-sm font-semibold">{formatAmount(orderValue(order, 'totalAmount', 'total_amount') ?? order.total)}</td>
            <td className="px-5 py-3"><button type="button" onClick={() => setSelected(order)} className="rounded-lg border border-brand-nude px-3 py-1.5 text-xs font-semibold hover:bg-brand-cream">{paymentView ? 'Payment details' : 'Manage'}</button></td>
          </tr>
        ))}
      </TableFrame>
      {selected && <OrderDetailModal order={selected} onClose={() => setSelected(null)} onUpdated={reloadSelected} paymentView={paymentView} />}
    </>
  );
}

export function AdminDashboardPage({ loadDashboard }) {
  const dashboard = useRemoteValue(loadDashboard);
  const data = dashboard.value;
  const cards = [
    ['Orders', data?.orders],
    ['Pending orders', data?.pendingOrders],
    ['Customers', data?.customers],
    ['Active products', data?.activeProducts],
  ];
  return (
    <>
      <div className="mb-6 flex items-end justify-between">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-roseGold">Store management</p><h1 className="mt-1 font-serif text-3xl font-semibold">Overview</h1><p className="mt-1 text-sm text-brand-subtle">A clear view of store performance, fulfillment, and catalog activity.</p></div>
        {data?.asOf && <span className="text-xs text-brand-subtle">Updated {formatDate(data.asOf)}</span>}
      </div>
      <ErrorBanner error={dashboard.error} onRetry={dashboard.reload} />
      {dashboard.isLoading ? <p role="status" className="py-16 text-center text-sm text-brand-subtle">Loading dashboard…</p> : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-brand-nude bg-white p-5 shadow-soft">
                <p className="text-sm font-medium text-brand-subtle">{label}</p>
                <p className="mt-4 font-serif text-3xl text-brand-charcoal">{value ?? '—'}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-brand-nude bg-white p-6 shadow-soft sm:p-8">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-brand-subtle">Revenue</p><p className="mt-2 font-serif text-3xl font-semibold">{data ? formatAmount(data.revenue) : '—'}</p></div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-cream text-brand-roseGold"><BadgePercent className="h-5 w-5" /></div>
            </div>
            <p className="mt-3 text-xs text-brand-subtle">Revenue totals follow the backend dashboard reporting period.</p>
          </div>
        </>
      )}
    </>
  );
}

export function AdminProducts() { return <AdminProductsPage />; }
export function AdminCategories() { return <AdminCategoriesPage />; }
export function AdminCustomers() { return <AdminCustomersPage />; }
export function AdminOrders() { return <OrdersTable />; }
export function AdminPayments() { return <OrdersTable paymentView />; }
export function AdminOffers() { return <AdminOffersPage />; }
