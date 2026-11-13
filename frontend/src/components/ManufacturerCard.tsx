type ManufacturerCardProps = {
  name: string;
  location: string;
  rating: number;
  quote: string;
  tone?: 'blue' | 'teal' | 'slate' | 'red';
};

const borderTone = {
  blue: 'border-[#003d4c]',
  teal: 'border-[#0f766e]',
  slate: 'border-outline-variant',
  red: 'border-error',
};

export function ManufacturerCard({ name, location, rating, quote, tone = 'slate' }: ManufacturerCardProps) {
  return (
    <article className={`page-card p-4 ${borderTone[tone]}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-[#1b1c1c]">{name}</h3>
          <p className="mt-1 text-sm text-[#656464]">{location}</p>
        </div>
        <div className="rounded-sm border border-[#b8860b] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[#b8860b]">
          {rating.toFixed(1)}
        </div>
      </div>
      <p className="mt-4 border-t border-outline-variant pt-3 text-sm text-[#41484b]">{quote}</p>
      <div className="mt-4 flex gap-2">
        <button className="btn-secondary">Request Quote</button>
        <button className="btn-ghost">View Catalog</button>
      </div>
    </article>
  );
}
