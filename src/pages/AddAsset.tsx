import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { categories } from "@/data/categories";
import { Asset } from "@/types/asset";
import { useToast } from "@/hooks/use-toast";

export default function AddAsset() {
  const navigate = useNavigate();
  const { addAsset, locations, generateAssetNumber } = useAssets();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    sapNumber: "",
    model: "",
    brand: "",
    serial: "",
    specification: "",
    itemName: "",
    officeNumber: "",
    yearNumber: new Date().getFullYear().toString().slice(-2),
    categoryNumber: "",
    itemNumber: "",
    location: "",
    sublocation: "",
    price: "",
    accruedDate: new Date().toISOString().split("T")[0],
    purchaseCode: "",
    voucherNumber: "",
    deductedAfterAuction: false,
    auctionedDate: "",
    tagAttached: false,
    quantity: "1",
    comments: "",
    assignedTo: "",
  });

  const [generatedAssetNumber, setGeneratedAssetNumber] = useState("");
  const [subcategories, setSubcategories] = useState<{ code: string; name: string }[]>([]);
  const [sublocations, setSublocations] = useState<string[]>([]);
  const [customItemNames, setCustomItemNames] = useState<string[]>([]);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
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

  // Update asset number when codes change
  useEffect(() => {
    if (formData.officeNumber && formData.yearNumber && formData.categoryNumber && formData.itemNumber) {
      const assetNum = generateAssetNumber(
        formData.officeNumber,
        formData.yearNumber,
        formData.categoryNumber,
        formData.itemNumber
      );
      setGeneratedAssetNumber(assetNum);
    } else {
      setGeneratedAssetNumber("");
    }
  }, [formData.officeNumber, formData.yearNumber, formData.categoryNumber, formData.itemNumber, generateAssetNumber]);

  // Update subcategories when category changes
  useEffect(() => {
    const category = categories.find((c) => c.code === formData.categoryNumber);
    setSubcategories(category?.subcategories || []);
    setFormData((prev) => ({ ...prev, itemNumber: "" }));
  }, [formData.categoryNumber]);

  // Update sublocations when location changes
  useEffect(() => {
    const location = locations.find((l) => l.name === formData.location);
    setSublocations(location?.sublocations || []);
    setFormData((prev) => ({ ...prev, sublocation: "" }));
  }, [formData.location, locations]);

  // Get all available item names (subcategories + custom) - filter out empty strings
  const availableItemNames = [...subcategories.map(s => s.name), ...customItemNames].filter(name => name && name.trim() !== "");

  const handleAddCustomItemName = () => {
    if (newItemName.trim() && !availableItemNames.includes(newItemName.trim())) {
      setCustomItemNames(prev => [...prev, newItemName.trim()]);
      setFormData(prev => ({ ...prev, itemName: newItemName.trim() }));
      setNewItemName("");
      setIsAddItemDialogOpen(false);
    }
  };

  const handleItemNameChange = (value: string) => {
    if (value === "__add_new__") {
      setIsAddItemDialogOpen(true);
    } else {
      updateField("itemName", value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!generatedAssetNumber) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields to generate an asset number.",
        variant: "destructive",
      });
      return;
    }

    const newAsset: Asset = {
      id: crypto.randomUUID(),
      assetNumber: generatedAssetNumber,
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
      sequenceNumber: generatedAssetNumber.split("-").pop() || "01",
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
      createdAt: new Date().toISOString(),
    };

    addAsset(newAsset);
    toast({
      title: "Asset Added",
      description: `Asset ${generatedAssetNumber} has been created successfully.`,
    });
    navigate("/assets");
  };

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <MainLayout title="Add New Asset" subtitle="Create a new asset record">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Asset Number Preview */}
        <div className="rounded-xl bg-card border border-border p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
              <Barcode className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Generated Asset Number</p>
              <p className="text-2xl font-mono font-bold text-card-foreground">
                {generatedAssetNumber || "XXX-XX-XX-XX-XX"}
              </p>
            </div>
          </div>
        </div>

        {/* Asset Number Components */}
        <div className="rounded-xl bg-card border border-border p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-semibold text-card-foreground">Asset Number Components</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                <SelectTrigger>
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
                placeholder="e.g., 01"
                value={formData.itemNumber}
                onChange={(e) => updateField("itemNumber", e.target.value)}
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
              <Select
                value={formData.itemName}
                onValueChange={handleItemNameChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select item name" />
                </SelectTrigger>
                <SelectContent>
                  {availableItemNames.map((name) => (
                    <SelectItem key={name} value={name}>
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
              <Input
                id="assignedTo"
                placeholder="Enter name"
                value={formData.assignedTo}
                onChange={(e) => updateField("assignedTo", e.target.value)}
              />
            </div>
          </div>
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
                  <SelectTrigger>
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
                  <SelectTrigger>
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
                <Label htmlFor="price">Price ($)</Label>
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
            Save Asset
          </Button>
        </div>
      </form>

      {/* Add New Item Dialog */}
      <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
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
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCustomItemName} disabled={!newItemName.trim()}>
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
