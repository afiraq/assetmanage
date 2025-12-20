import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft, Barcode, Plus } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAssets } from "@/hooks/useAssets";
import { categories, getSubcategoryByCode } from "@/data/categories";
import { useToast } from "@/hooks/use-toast";
import { useStaff } from "@/hooks/useStaff";
import { Skeleton } from "@/components/ui/skeleton";
import { AssetImageUpload } from "@/components/assets/AssetImageUpload";

export default function EditAsset() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { assets, updateAsset, locations } = useAssets();
  const { activeStaff, isLoading: staffLoading } = useStaff();
  const { toast } = useToast();

  const asset = assets.find((a) => a.id === id);

  const [formData, setFormData] = useState({
    sapNumber: "",
    model: "",
    brand: "",
    serial: "",
    specification: "",
    itemName: "",
    officeNumber: "",
    yearNumber: "",
    categoryNumber: "",
    itemNumber: "",
    sequenceNumber: "",
    location: "",
    sublocation: "",
    price: "",
    accruedDate: "",
    purchaseCode: "",
    voucherNumber: "",
    deductedAfterAuction: false,
    auctionedDate: "",
    tagAttached: false,
    quantity: "1",
    comments: "",
    assignedTo: "",
    imageUrl: null as string | null,
  });

  const [subcategories, setSubcategories] = useState<{ code: string; name: string }[]>([]);
  const [sublocations, setSublocations] = useState<string[]>([]);
  const [customItemNames, setCustomItemNames] = useState<string[]>([]);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [appUsers, setAppUsers] = useState<{ id: string; name: string }[]>([]);

  // Load users from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("appUsers");
    if (stored) {
      const users = JSON.parse(stored);
      setAppUsers(users.map((u: { id: string; name: string }) => ({ id: u.id, name: u.name })));
    }
  }, []);

  // Load asset data when found
  useEffect(() => {
    if (asset) {
      setFormData({
        sapNumber: asset.sapNumber || "",
        model: asset.model || "",
        brand: asset.brand || "",
        serial: asset.serial || "",
        specification: asset.specification || "",
        itemName: asset.itemName || "",
        officeNumber: asset.officeNumber || "",
        yearNumber: asset.yearNumber || "",
        categoryNumber: asset.categoryNumber || "",
        itemNumber: asset.itemNumber || "",
        sequenceNumber: asset.sequenceNumber || "",
        location: asset.location || "",
        sublocation: asset.sublocation || "",
        price: asset.price?.toString() || "",
        accruedDate: asset.accruedDate || "",
        purchaseCode: asset.purchaseCode || "",
        voucherNumber: asset.voucherNumber || "",
        deductedAfterAuction: asset.deductedAfterAuction || false,
        auctionedDate: asset.auctionedDate || "",
        tagAttached: asset.tagAttached || false,
        quantity: asset.quantity?.toString() || "1",
        comments: asset.comments || "",
        assignedTo: asset.assignedTo || "",
        imageUrl: asset.imageUrl || null,
      });
    }
  }, [asset]);

  // Update subcategories when category changes
  useEffect(() => {
    const category = categories.find((c) => c.code === formData.categoryNumber);
    setSubcategories(category?.subcategories || []);
  }, [formData.categoryNumber]);

  // Update sublocations when location changes
  useEffect(() => {
    const location = locations.find((l) => l.name === formData.location);
    setSublocations(location?.sublocations || []);
  }, [formData.location, locations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !asset) {
      toast({
        title: "Error",
        description: "Asset not found.",
        variant: "destructive",
      });
      return;
    }

    const newAssetNumber = `${formData.officeNumber}-${formData.yearNumber}-${formData.categoryNumber}-${formData.itemNumber}-${formData.sequenceNumber}`;
    
    const { error } = await updateAsset(id, {
      assetNumber: newAssetNumber,
      sapNumber: formData.sapNumber,
      model: formData.model,
      brand: formData.brand,
      serial: formData.serial,
      specification: formData.specification,
      itemName: formData.itemName,
      officeNumber: formData.officeNumber,
      yearNumber: formData.yearNumber,
      categoryNumber: formData.categoryNumber,
      itemNumber: formData.itemNumber,
      sequenceNumber: formData.sequenceNumber,
      location: formData.location,
      sublocation: formData.sublocation,
      price: parseFloat(formData.price) || 0,
      accruedDate: formData.accruedDate,
      purchaseCode: formData.purchaseCode,
      voucherNumber: formData.voucherNumber,
      deductedAfterAuction: formData.deductedAfterAuction,
      auctionedDate: formData.auctionedDate || null,
      tagAttached: formData.tagAttached,
      quantity: parseInt(formData.quantity) || 1,
      comments: formData.comments,
      assignedTo: formData.assignedTo,
      imageUrl: formData.imageUrl,
    });

    if (!error) {
      toast({
        title: "Asset Updated",
        description: `Asset ${newAssetNumber} has been updated successfully.`,
      });
      navigate("/assets");
    }
  };

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddCustomItem = () => {
    if (newItemName.trim()) {
      setCustomItemNames((prev) => [...prev, newItemName.trim()]);
      updateField("itemName", newItemName.trim());
      setNewItemName("");
      setShowAddItemDialog(false);
      toast({
        title: "Item Added",
        description: `"${newItemName.trim()}" has been added to the list.`,
      });
    }
  };

  const allItemNames = [
    ...subcategories.map((sub) => sub.name),
    ...customItemNames,
  ].filter(name => name && name.trim() !== "");

  if (!asset) {
    return (
      <MainLayout title="Edit Asset" subtitle="Asset not found">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">The requested asset could not be found.</p>
          <Button onClick={() => navigate("/assets")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assets
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Edit Asset" subtitle="Modify asset details">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Asset Number Preview */}
        <div className="rounded-xl bg-card border border-border p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
              <Barcode className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Asset Number (Preview)</p>
              <p className="text-2xl font-mono font-bold text-card-foreground">
                {`${formData.officeNumber}-${formData.yearNumber}-${formData.categoryNumber}-${formData.itemNumber}-${formData.sequenceNumber}`}
              </p>
            </div>
          </div>
        </div>

        {/* Asset Number Components */}
        <div className="rounded-xl bg-card border border-border p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-semibold text-card-foreground">Asset Number Components</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="officeNumber">Office Number *</Label>
              <Input
                id="officeNumber"
                placeholder="e.g., 221"
                value={formData.officeNumber}
                onChange={(e) => updateField("officeNumber", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearNumber">Year Number *</Label>
              <Input
                id="yearNumber"
                placeholder="e.g., 25"
                value={formData.yearNumber}
                onChange={(e) => updateField("yearNumber", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryNumber">Category *</Label>
              <Select
                value={formData.categoryNumber}
                onValueChange={(value) => updateField("categoryNumber", value)}
              >
                <SelectTrigger id="categoryNumber">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.code}>
                      {cat.code} - {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemNumber">Item Code *</Label>
              <Input
                id="itemNumber"
                placeholder="e.g., 03"
                value={formData.itemNumber}
                onChange={(e) => updateField("itemNumber", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sequenceNumber">Sequence Number *</Label>
              <Input
                id="sequenceNumber"
                placeholder="e.g., 01"
                value={formData.sequenceNumber}
                onChange={(e) => updateField("sequenceNumber", e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="rounded-xl bg-card border border-border p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-semibold text-card-foreground">Basic Information</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="sapNumber">SAP Number</Label>
              <Input
                id="sapNumber"
                placeholder="Enter SAP number"
                value={formData.sapNumber}
                onChange={(e) => updateField("sapNumber", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemName">Item Name *</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.itemName}
                  onValueChange={(value) => {
                    if (value === "__add_new__") {
                      setShowAddItemDialog(true);
                    } else {
                      updateField("itemName", value);
                    }
                  }}
                >
                  <SelectTrigger id="itemName" className="flex-1">
                    <SelectValue placeholder={subcategories.length === 0 && customItemNames.length === 0 ? "Select category first" : "Select item name"} />
                  </SelectTrigger>
                  <SelectContent>
                    {allItemNames.map((name, index) => (
                      <SelectItem key={`${name}-${index}`} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                    <SelectItem value="__add_new__" className="text-primary">
                      <span className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add New Item
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                placeholder="Enter brand"
                value={formData.brand}
                onChange={(e) => updateField("brand", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                placeholder="Enter model"
                value={formData.model}
                onChange={(e) => updateField("model", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serial">Serial Number</Label>
              <Input
                id="serial"
                placeholder="Enter serial number"
                value={formData.serial}
                onChange={(e) => updateField("serial", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="1"
                value={formData.quantity}
                onChange={(e) => updateField("quantity", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              {staffLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={formData.assignedTo || "__none__"}
                  onValueChange={(value) => updateField("assignedTo", value === "__none__" ? "" : value)}
                >
                  <SelectTrigger id="assignedTo">
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Not Assigned</SelectItem>
                    {activeStaff.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                        {member.department && ` (${member.department})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="specification">Specification</Label>
              <Textarea
                id="specification"
                placeholder="Enter specifications..."
                value={formData.specification}
                onChange={(e) => updateField("specification", e.target.value)}
                rows={3}
              />
            </div>
            <AssetImageUpload
              imageUrl={formData.imageUrl}
              onImageChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
              assetId={id}
            />
          </div>
        </div>

        {/* Location & Financial */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl bg-card border border-border p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-semibold text-card-foreground">Location</h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => updateField("location", value)}
                >
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.name}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sublocation">Sublocation</Label>
                <Select
                  value={formData.sublocation}
                  onValueChange={(value) => updateField("sublocation", value)}
                  disabled={sublocations.length === 0}
                >
                  <SelectTrigger id="sublocation">
                    <SelectValue placeholder={sublocations.length === 0 ? "Select location first" : "Select sublocation"} />
                  </SelectTrigger>
                  <SelectContent>
                    {sublocations.map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-card border border-border p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-semibold text-card-foreground">Financial</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price (MVR)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => updateField("price", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accruedDate">Accrued Date</Label>
                <Input
                  id="accruedDate"
                  type="date"
                  value={formData.accruedDate}
                  onChange={(e) => updateField("accruedDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchaseCode">Purchase Code</Label>
                <Input
                  id="purchaseCode"
                  placeholder="Enter purchase code"
                  value={formData.purchaseCode}
                  onChange={(e) => updateField("purchaseCode", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="voucherNumber">Voucher Number</Label>
                <Input
                  id="voucherNumber"
                  placeholder="Enter voucher number"
                  value={formData.voucherNumber}
                  onChange={(e) => updateField("voucherNumber", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Status & Auction */}
        <div className="rounded-xl bg-card border border-border p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-semibold text-card-foreground">Status & Tracking</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center space-x-3 rounded-lg border border-border p-4">
              <Checkbox
                id="tagAttached"
                checked={formData.tagAttached}
                onCheckedChange={(checked) => updateField("tagAttached", !!checked)}
              />
              <Label htmlFor="tagAttached" className="cursor-pointer">Tag Attached</Label>
            </div>
            <div className="flex items-center space-x-3 rounded-lg border border-border p-4">
              <Checkbox
                id="deductedAfterAuction"
                checked={formData.deductedAfterAuction}
                onCheckedChange={(checked) => updateField("deductedAfterAuction", !!checked)}
              />
              <Label htmlFor="deductedAfterAuction" className="cursor-pointer">Deducted After Auction</Label>
            </div>
            {formData.deductedAfterAuction && (
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="auctionedDate">Auctioned Date</Label>
                <Input
                  id="auctionedDate"
                  type="date"
                  value={formData.auctionedDate}
                  onChange={(e) => updateField("auctionedDate", e.target.value)}
                />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="comments">Comments</Label>
            <Textarea
              id="comments"
              placeholder="Additional notes..."
              value={formData.comments}
              onChange={(e) => updateField("comments", e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => navigate("/assets")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>

      {/* Add New Item Dialog */}
      <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Item Name</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newItemName">Item Name</Label>
              <Input
                id="newItemName"
                placeholder="Enter new item name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomItem();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddItemDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCustomItem} disabled={!newItemName.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
