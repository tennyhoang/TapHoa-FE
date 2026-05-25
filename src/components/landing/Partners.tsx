const PARTNERS = [
  { name: 'Grano Foods', sub: 'Ngũ cốc & Gạo' },
  { name: 'Foodic', sub: 'Thực phẩm chế biến' },
  { name: 'Good Food', sub: 'Rau củ VietGAP' },
  { name: "Foody's", sub: 'Gia vị & Hàng khô' },
  { name: 'Fresh Market', sub: 'Trái cây tươi' },
  { name: 'Ocean Fresh', sub: 'Hải sản tươi sống' },
];

export function Partners() {
  return (
    <section className="py-10 border-t border-border/60">
      <div className="text-center mb-8">
        <span className="text-[11px] font-bold text-primary uppercase tracking-[0.18em]">Đối tác</span>
        <h2 className="font-editorial font-black text-[1.5rem] text-foreground mt-1">
          Thương hiệu uy tín
        </h2>
        <p className="text-muted-foreground text-sm mt-2">
          Hợp tác cùng các nhà cung cấp được kiểm định kỹ càng
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {PARTNERS.map(p => (
          <div
            key={p.name}
            className="bg-card border border-border/60 rounded-2xl px-6 py-4 text-center hover:border-primary/30 hover:shadow-sm transition-all duration-200"
          >
            <span className="text-sm font-bold text-foreground block">{p.name}</span>
            <span className="text-[11px] text-muted-foreground">{p.sub}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
