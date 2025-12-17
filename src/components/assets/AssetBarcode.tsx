import Barcode from "react-barcode";
import { Asset } from "@/types/asset";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Barcode as BarcodeIcon, Printer } from "lucide-react";

interface AssetBarcodeProps {
  asset: Asset;
}

export function AssetBarcode({ asset }: AssetBarcodeProps) {
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const barcodeElement = document.getElementById(`barcode-${asset.id}`);
    if (!barcodeElement) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Barcode - ${asset.assetNumber}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: system-ui, sans-serif;
            }
            .label {
              text-align: center;
              padding: 20px;
              border: 1px dashed #ccc;
            }
            .asset-info {
              margin-bottom: 10px;
              font-size: 12px;
            }
            .item-name {
              font-weight: bold;
              font-size: 14px;
            }
            @media print {
              .label { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="asset-info">
              <div class="item-name">${asset.itemName}</div>
              <div>${asset.brand} ${asset.model}</div>
              <div>SAP: ${asset.sapNumber}</div>
            </div>
            ${barcodeElement.outerHTML}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <BarcodeIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Asset Barcode</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="text-center space-y-1">
            <p className="font-semibold">{asset.itemName}</p>
            <p className="text-sm text-muted-foreground">
              {asset.brand} {asset.model}
            </p>
            <p className="text-xs text-muted-foreground">SAP: {asset.sapNumber}</p>
          </div>
          <div id={`barcode-${asset.id}`} className="bg-white p-4 rounded-lg">
            <Barcode
              value={asset.assetNumber}
              width={2}
              height={80}
              fontSize={14}
              margin={10}
            />
          </div>
          <Button onClick={handlePrint} className="w-full">
            <Printer className="h-4 w-4 mr-2" />
            Print Barcode
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
