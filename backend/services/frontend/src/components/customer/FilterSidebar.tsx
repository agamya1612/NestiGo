export function FilterSidebar({ vertical }: { vertical: string }) {
  return (
    <div className="w-64 flex-shrink-0 hidden md:block border-r pr-6">
      <h3 className="font-bold mb-4 capitalize">{vertical} Filters</h3>
      <div className="space-y-2">
        <label className="flex items-center gap-2"><input type="checkbox" /> In Stock</label>
        <label className="flex items-center gap-2"><input type="checkbox" /> High Rated</label>
      </div>
    </div>
  );
}
