import { useState } from "react";
import { MapPin, Plus, Pencil, Trash2, Building2 } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAssets } from "@/hooks/useAssets";
import { useToast } from "@/hooks/use-toast";
import { Location } from "@/types/asset";

export default function Locations() {
  const { locations, assets, addLocation, updateLocation, deleteLocation } = useAssets();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({ name: "", sublocations: "" });

  const getLocationAssetCount = (locationName: string) => {
    return assets.filter((a) => a.location === locationName).length;
  };

  const handleOpenDialog = (location?: Location) => {
    if (location) {
      setEditingLocation(location);
      setFormData({
        name: location.name,
        sublocations: location.sublocations.join(", "),
      });
    } else {
      setEditingLocation(null);
      setFormData({ name: "", sublocations: "" });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const sublocationsArray = formData.sublocations
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingLocation) {
      updateLocation(editingLocation.id, {
        name: formData.name,
        sublocations: sublocationsArray,
      });
      toast({
        title: "Location Updated",
        description: `${formData.name} has been updated.`,
      });
    } else {
      addLocation({
        id: crypto.randomUUID(),
        name: formData.name,
        sublocations: sublocationsArray,
      });
      toast({
        title: "Location Added",
        description: `${formData.name} has been added.`,
      });
    }

    setIsDialogOpen(false);
  };

  const handleDelete = (location: Location) => {
    const assetCount = getLocationAssetCount(location.name);
    if (assetCount > 0) {
      toast({
        title: "Cannot Delete",
        description: `${location.name} has ${assetCount} assets assigned. Please reassign them first.`,
        variant: "destructive",
      });
      return;
    }

    if (confirm(`Are you sure you want to delete "${location.name}"?`)) {
      deleteLocation(location.id);
      toast({
        title: "Location Deleted",
        description: `${location.name} has been removed.`,
      });
    }
  };

  return (
    <MainLayout title="Locations" subtitle="Manage asset locations and sublocations">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {locations.length} locations configured
          </p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingLocation ? "Edit Location" : "Add New Location"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Location Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Head Office"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sublocations">Sublocations (comma-separated)</Label>
                  <Input
                    id="sublocations"
                    placeholder="e.g., Floor 1, Floor 2, Storage"
                    value={formData.sublocations}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sublocations: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingLocation ? "Update" : "Add"} Location
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Locations Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => {
            const assetCount = getLocationAssetCount(location.name);
            return (
              <div
                key={location.id}
                className="rounded-xl bg-card border border-border p-6 shadow-sm animate-fade-in"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground">{location.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {location.sublocations.length} sublocations
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{assetCount} assets</Badge>
                </div>

                {location.sublocations.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {location.sublocations.map((sub) => (
                      <Badge key={sub} variant="outline" className="text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        {sub}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenDialog(location)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(location)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
