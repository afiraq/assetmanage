import { categories } from "@/data/categories";
import { Asset } from "@/types/asset";

interface CategoryBreakdownProps {
  assets: Asset[];
}

export function CategoryBreakdown({ assets }: CategoryBreakdownProps) {
  const categoryStats = categories.map((category) => {
    const count = assets.filter((asset) => asset.categoryNumber === category.code).length;
    return { ...category, count };
  });

  const maxCount = Math.max(...categoryStats.map((c) => c.count), 1);

  return (
    <div className="rounded-xl bg-card border border-border shadow-sm animate-fade-in">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-card-foreground">Category Breakdown</h3>
        <p className="text-sm text-muted-foreground">Assets by category</p>
      </div>
      <div className="p-6 space-y-4">
        {categoryStats.map((category) => (
          <div key={category.id} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-card-foreground font-medium">{category.name}</span>
              <span className="text-muted-foreground font-mono">{category.count}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full gradient-primary transition-all duration-500"
                style={{ width: `${(category.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
