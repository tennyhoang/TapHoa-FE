const PARTNERS = [
  { name: 'Grano Foods',  emoji: '🌾' },
  { name: 'Foodic',       emoji: '🍽️' },
  { name: 'Good Food',    emoji: '✅' },
  { name: "Foody's",      emoji: '🍱' },
  { name: 'Fresh Market', emoji: '🛒' },
  { name: 'Ocean Fresh',  emoji: '🌊' },
];

export function Partners() {
  return (
    <section className="py-8 border-t border-orange-100">
      <h2 className="text-center text-lg font-black text-stone-900 mb-2">Đại lý ủy quyền & Đối tác</h2>
      <p className="text-center text-sm text-stone-500 mb-6">Hợp tác cùng các thương hiệu uy tín</p>

      <div className="flex flex-wrap justify-center gap-4">
        {PARTNERS.map(p => (
          <div
            key={p.name}
            className="flex items-center gap-2.5 bg-white border border-orange-100 rounded-xl px-5 py-3 hover:border-orange-300 hover:shadow-sm transition-all cursor-pointer"
          >
            <span className="text-2xl select-none">{p.emoji}</span>
            <span className="text-sm font-semibold text-stone-700">{p.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
