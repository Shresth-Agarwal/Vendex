type ProductCardProps = {
  name: string;
  category: string;
  price: number;
  image: string;
  stock: string;
};

export function ProductCard({ name, category, price, image, stock }: ProductCardProps) {
  const isLow = stock.toLowerCase().includes('low');

  return (
    <article className="page-card overflow-hidden transition-transform hover:-translate-y-0.5">
      <div className="relative h-48 overflow-hidden bg-surface-container-low">
        <img src={image} alt={name} className="h-full w-full object-cover" />
        <span className={`chip absolute right-3 top-3 ${isLow ? 'chip-warning' : 'chip-success'}`}>{stock}</span>
      </div>
      <div className="space-y-3 p-4">
        <div>
          <h3 className="text-lg font-semibold text-[#1b1c1c]">{name}</h3>
          <p className="text-sm text-[#656464]">{category}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-[#003d4c]">${price.toFixed(2)}</span>
          <button className="btn-primary">Add to Cart</button>
        </div>
      </div>
    </article>
  );
}
