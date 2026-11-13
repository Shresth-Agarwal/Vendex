import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { ProductCard } from '@/components/ProductCard';
import { consumerQuickFilters } from '@/data/vendexContent';
import { FiBell, FiShoppingCart } from 'react-icons/fi';
import { productService } from '@/services/productService';

export function ConsumerMarketplacePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await productService.getProducts();
        if (data && Array.isArray(data)) {
          setProducts(data);
        } else if (data && data.content && Array.isArray(data.content)) {
          // Fallback if backend returns paginated format
          setProducts(data.content);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load products. Please check if the backend is running.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleGenerateManifest = () => {
    setIsGenerating(true);
    // API Placeholder: Send intent to backend
    setTimeout(() => {
      setIsGenerating(false);
      alert('Manifest generated! (Backend integration pending)');
    }, 1000);
  };

  return (
    <div className="page-stack">
      <AppHeader
        brand="Vendex"
        links={[
          { label: 'Marketplace', to: '/consumer' },
          { label: 'Suppliers', to: '/store-owner/discovery' },
          { label: 'Inventory', to: '/store-owner' },
          { label: 'Analytics', to: '/manufacturer' },
        ]}
        searchPlaceholder="Search products..."
        actions={
          <>
            <button className="btn-ghost p-2">
              <span className="material-symbols-outlined">shopping_cart</span>
            </button>
            <button className="btn-ghost p-2">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="h-8 w-8 overflow-hidden border border-outline-variant bg-surface-container-high">
              <img
                alt="User profile"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKgS3x2EPX5_DSrzTCf1j2iaeK3t8lLKaOAXl6s2Ehucdj07HeMoJMUUHCxDviG91CSTUc_9GlcsPvdz6pkv48Ii4bT9bdLQMoWEyFunE9Gcs6-w5T-4JDkiz9n3m6kk2jMFQJjmKca6Q9MQObDMV2sN1bSJbSbBL9du7B_byir5_tzekXVvqI8SvUZ6bAYvsBikZlf7hgkTw4sQCKVIhuhWBfQ1v39A0mND_Z4TofQWdvTixlmgANsg8egxTzAg7OBhB_ElMC2Bkr"
                className="h-full w-full object-cover"
              />
            </div>
          </>
        }
      />

      <main className="surface-shell flex-1 py-10">
        <section className="border border-outline-variant bg-surface-container-low py-14 text-center">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-6">
            <p className="muted-label">Smart Sourcing</p>
            <h1 className="text-4xl font-bold tracking-tight text-[#003d4c] md:text-5xl">Describe what you need and generate a manifest.</h1>
            <p className="max-w-2xl text-lg leading-7 text-[#41484b]">
              Use natural language to create a precise shopping intent that maps directly to available supply.
            </p>
            <div className="mt-2 flex w-full flex-col gap-2 border border-outline-variant bg-surface-container-lowest p-1 sm:flex-row">
              <input className="input-field flex-1 border-none bg-transparent" placeholder="e.g. monthly grocery for family of 4, high protein..." />
              <button 
                className="btn-primary px-8 py-3" 
                onClick={handleGenerateManifest}
                disabled={isGenerating}
              >
                <span className="material-symbols-outlined text-sm">magic_button</span>
                {isGenerating ? 'Generating...' : 'Generate Manifest'}
              </button>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {consumerQuickFilters.map((filter) => (
                <span key={filter} className="chip">
                  {filter}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 space-y-6">
          <div className="flex items-end justify-between border-b border-outline-variant pb-3">
            <h2 className="text-3xl font-bold tracking-tight text-[#1b1c1c]">Recommended Inventory</h2>
            <div className="flex gap-2">
              <button className="btn-secondary">
                <span className="material-symbols-outlined text-sm">filter_list</span>
                Filter
              </button>
              <button className="btn-secondary">
                <span className="material-symbols-outlined text-sm">sort</span>
                Sort
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-[#656464]">
              <span className="material-symbols-outlined animate-spin text-4xl">autorenew</span>
              <p className="mt-2 font-medium">Loading marketplace products...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-error border border-error/20 bg-error/5 rounded-sm">
              <span className="material-symbols-outlined text-4xl">error</span>
              <p className="mt-2 font-medium">{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center text-[#656464] border border-outline-variant bg-surface-container-lowest rounded-sm">
              <span className="material-symbols-outlined text-4xl">inventory_2</span>
              <p className="mt-2 font-medium">No products found. Start by adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.name || product.sku || Math.random().toString()} {...product} />
              ))}
            </div>
          )}
        </section>

        <section className="mt-10 grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="page-card p-6">
            <h3 className="text-2xl font-bold tracking-tight text-[#1b1c1c]">Search Results</h3>
            <p className="mt-2 text-sm text-[#656464]">Backend data will replace these placeholders once the API is connected.</p>
          </div>
          <aside className="page-card p-6">
            <h3 className="text-lg font-semibold text-[#1b1c1c]">Your Selection</h3>
            <div className="mt-4 space-y-3 text-sm text-[#41484b]">
              <div className="flex items-center justify-between border-b border-outline-variant pb-2">
                <span>Organic Coffee Beans</span>
                <span>2</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Fresh Pasta Bundle</span>
                <span>1</span>
              </div>
            </div>
            <button className="btn-primary mt-6 w-full">Checkout</button>
          </aside>
        </section>
      </main>
    </div>
  );
}
