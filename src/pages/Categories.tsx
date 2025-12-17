import { useState } from "react";
import { ChevronDown, ChevronRight, FolderTree, Plus } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { categories } from "@/data/categories";
import { cn } from "@/lib/utils";
import { useAssets } from "@/hooks/useAssets";

export default function Categories() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const { assets } = useAssets();

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const getCategoryAssetCount = (categoryCode: string) => {
    return assets.filter((a) => a.categoryNumber === categoryCode).length;
  };

  const getSubcategoryAssetCount = (categoryCode: string, itemCode: string) => {
    return assets.filter(
      (a) => a.categoryNumber === categoryCode && a.itemNumber === itemCode
    ).length;
  };

  return (
    <MainLayout title="Categories" subtitle="Browse asset categories and items">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {categories.length} categories with {categories.reduce((sum, c) => sum + c.subcategories.length, 0)} item types
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Categories List */}
        <div className="space-y-3">
          {categories.map((category) => {
            const isExpanded = expandedCategories.includes(category.id);
            const assetCount = getCategoryAssetCount(category.code);

            return (
              <div
                key={category.id}
                className="rounded-xl bg-card border border-border shadow-sm overflow-hidden animate-fade-in"
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FolderTree className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-muted-foreground">
                          {category.code}
                        </span>
                        <h3 className="font-semibold text-card-foreground">
                          {category.name}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {category.subcategories.length} item types
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{assetCount} assets</Badge>
                    {category.subcategories.length > 0 && (
                      isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )
                    )}
                  </div>
                </button>

                {/* Subcategories */}
                {isExpanded && category.subcategories.length > 0 && (
                  <div className="border-t border-border bg-muted/30">
                    <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3 p-3">
                      {category.subcategories.map((sub) => {
                        const subAssetCount = getSubcategoryAssetCount(category.code, sub.code);
                        return (
                          <div
                            key={sub.code}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-lg bg-card hover:bg-muted/50 transition-colors",
                              subAssetCount > 0 && "ring-1 ring-primary/20"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                {sub.code}
                              </span>
                              <span className="text-sm font-medium text-card-foreground">
                                {sub.name}
                              </span>
                            </div>
                            {subAssetCount > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {subAssetCount}
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
