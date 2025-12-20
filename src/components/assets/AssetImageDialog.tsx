import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Asset } from "@/types/asset";
import { ImageOff } from "lucide-react";

interface AssetImageDialogProps {
  asset: Asset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssetImageDialog({ asset, open, onOpenChange }: AssetImageDialogProps) {
  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex flex-col gap-1">
            <span>{asset.itemName}</span>
            <span className="text-sm font-mono font-normal text-muted-foreground">
              {asset.assetNumber}
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {asset.imageUrl ? (
            <img
              src={asset.imageUrl}
              alt={asset.itemName}
              className="w-full max-h-[60vh] object-contain rounded-lg"
            />
          ) : (
            <div className="w-full h-64 bg-muted rounded-lg flex flex-col items-center justify-center text-muted-foreground">
              <ImageOff className="h-16 w-16 mb-4" />
              <p className="text-lg font-medium">No image available</p>
              <p className="text-sm">This asset doesn't have an image attached</p>
            </div>
          )}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Brand:</span>
            <span className="ml-2 font-medium">{asset.brand || "-"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Model:</span>
            <span className="ml-2 font-medium">{asset.model || "-"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Location:</span>
            <span className="ml-2 font-medium">
              {asset.location}
              {asset.sublocation && ` / ${asset.sublocation}`}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Price:</span>
            <span className="ml-2 font-medium font-mono">MVR {asset.price.toLocaleString()}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
