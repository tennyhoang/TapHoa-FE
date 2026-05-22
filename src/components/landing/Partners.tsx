const PARTNERS = [
  'Grano Foods',
  'Foodic',
  'Good Food',
  "Foody's",
  'Fresh Market',
  'Ocean Fresh',
];

export function Partners() {
  return (
    <section className="py-8 border-t border-gray-100">
      <h2 className="text-center text-lg font-black text-gray-800 mb-2">Đại lý ủy quyền & Đối tác</h2>
      <p className="text-center text-sm text-gray-500 mb-6">Hợp tác cùng các thương hiệu uy tín</p>

      <div className="flex flex-wrap justify-center gap-4">
        {PARTNERS.map(name => (
          <div
            key={name}
            className="bg-white border border-gray-200 rounded-xl px-6 py-3 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
          >
            <span className="text-sm font-semibold text-gray-600">{name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
