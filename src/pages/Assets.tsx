import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Download, Upload, Search, Filter, Eye, Pencil, Trash2 } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAssets } from "@/hooks/useAssets";
import { categories } from "@/data/categories";
import { useToast } from "@/hooks/use-toast";
import { AssetBarcode } from "@/components/assets/AssetBarcode";
import { AssetImageDialog } from "@/components/assets/AssetImageDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useStaff } from "@/hooks/useStaff";
import { Asset } from "@/types/asset";

export default function Assets() {
  const navigate = useNavigate();
  const { assets, exportToCSV, importFromCSV, deleteAsset } = useAssets();
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const { staff } = useStaff();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  const getStaffName = (staffId: string) => {
    if (!staffId) return "-";
    // First try to find by ID
    const staffMember = staff.find((s) => s.id === staffId);
    if (staffMember) return staffMember.name;
    // Fallback: check if it's already a name (for old data)
    const staffByName = staff.find((s) => s.name === staffId);
    if (staffByName) return staffByName.name;
    return staffId || "-";
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.itemName.toLowerCase().includes(search.toLowerCase()) ||
      asset.assetNumber.toLowerCase().includes(search.toLowerCase()) ||
      asset.sapNumber.toLowerCase().includes(search.toLowerCase()) ||
      asset.brand.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory =
      categoryFilter === "all" || asset.categoryNumber === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importFromCSV(file)
        .then(() => {
          toast({
            title: "Import Successful",
            description: "Assets have been imported from CSV.",
          });
        })
        .catch(() => {
          toast({
            title: "Import Failed",
            description: "Failed to import assets from CSV.",
            variant: "destructive",
          });
        });
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteAsset(id);
      toast({
        title: "Asset Deleted",
        description: `${name} has been removed.`,
      });
    }
  };

  return (
    <MainLayout title="Assets" subtitle="Manage your asset inventory">
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, asset number, SAP, brand..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.code}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCSV} disabled={assets.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <label>
              <Button variant="outline" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </span>
              </Button>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleImport}
              />
            </label>
            <Button asChild>
              <Link to="/assets/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Asset
              </Link>
            </Button>
          </div>
        </div>

        {/* Assets Table */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Asset Number</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Brand / Model</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    {assets.length === 0 ? (
                      <div className="space-y-2">
                        <p>No assets found</p>
                        <Button asChild size="sm">
                          <Link to="/assets/new">Add your first asset</Link>
                        </Button>
                      </div>
                    ) : (
                      "No assets match your search criteria"
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssets.map((asset) => (
                  <TableRow key={asset.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-sm font-medium">
                      {asset.assetNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{asset.itemName}</p>
                        <p className="text-xs text-muted-foreground">SAP: {asset.sapNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{asset.brand}</p>
                        <p className="text-xs text-muted-foreground">{asset.model}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{asset.location}</p>
                        {asset.sublocation && (
                          <p className="text-xs text-muted-foreground">{asset.sublocation}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{getStaffName(asset.assignedTo)}</p>
                    </TableCell>
                    <TableCell className="font-mono">
                      MVR {asset.price.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Badge variant={asset.tagAttached ? "default" : "secondary"} className="text-xs">
                          {asset.tagAttached ? "Tagged" : "Untagged"}
                        </Badge>
                        {asset.deductedAfterAuction && (
                          <Badge variant="destructive" className="text-xs">Auctioned</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <AssetBarcode asset={asset} />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => {
                            setSelectedAsset(asset);
                            setImageDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => navigate(`/assets/${asset.id}/edit`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(asset.id, asset.itemName)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <p>
            Showing {filteredAssets.length} of {assets.length} assets
          </p>
          <p>
            Total Value: <span className="font-mono font-medium text-foreground">
              MVR {filteredAssets.reduce((sum, a) => sum + a.price, 0).toLocaleString()}
            </span>
          </p>
        </div>
      </div>

      <AssetImageDialog
        asset={selectedAsset}
        open={imageDialogOpen}
        onOpenChange={setImageDialogOpen}
      />
    </MainLayout>
  );
}
