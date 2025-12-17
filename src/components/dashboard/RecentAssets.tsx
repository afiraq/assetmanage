import { Badge } from "@/components/ui/badge";
import { Asset } from "@/types/asset";

interface RecentAssetsProps {
  assets: Asset[];
}

export function RecentAssets({ assets }: RecentAssetsProps) {
  return (
    <div className="rounded-xl bg-card border border-border shadow-sm animate-fade-in">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-card-foreground">Recent Assets</h3>
        <p className="text-sm text-muted-foreground">Latest additions to inventory</p>
      </div>
      <div className="divide-y divide-border">
        {assets.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No assets added yet
          </div>
        ) : (
          assets.slice(0, 5).map((asset) => (
            <div key={asset.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <span className="text-xs font-mono font-medium text-primary">
                    {asset.categoryNumber}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-card-foreground">{asset.itemName}</p>
                  <p className="text-sm text-muted-foreground font-mono">{asset.assetNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={asset.tagAttached ? "default" : "secondary"}>
                  {asset.tagAttached ? "Tagged" : "Untagged"}
                </Badge>
                <span className="text-sm text-muted-foreground">{asset.location}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
