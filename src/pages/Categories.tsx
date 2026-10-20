import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, FolderTree, Plus, Pencil, Trash2 } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { categories as defaultCategories } from "@/data/categories";
import { cn } from "@/lib/utils";
import { useAssets } from "@/hooks/useAssets";
import { useToast } from "@/hooks/use-toast";
import { Category } from "@/types/asset";

export default function Categories() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newCategoryCode, setNewCategoryCode] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const { assets } = useAssets();
  const { toast } = useToast();

  // Load categories from localStorage or use defaults
  useEffect(() => {
    const stored = localStorage.getItem("categories");
    if (stored) {
      setCategoriesList(JSON.parse(stored));
    } else {
      setCategoriesList(defaultCategories);
    }
  }, []);

  // Save categories to localStorage
  const saveCategories = (cats: Category[]) => {
    localStorage.setItem("categories", JSON.stringify(cats));
    setCategoriesList(cats);
  };

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

  const handleAddCategory = () => {
    if (!newCategoryCode.trim() || !newCategoryName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter both category code and name.",
        variant: "destructive",
      });
      return;
    }

    if (categoriesList.some(c => c.code === newCategoryCode.trim())) {
      toast({
        title: "Duplicate Code",
        description: "A category with this code already exists.",
        variant: "destructive",
      });
      return;
    }

    const newCategory: Category = {
      id: crypto.randomUUID(),
      code: newCategoryCode.trim().padStart(2, '0'),
      name: newCategoryName.trim(),
      subcategories: [],
    };

    saveCategories([...categoriesList, newCategory]);
    setNewCategoryCode("");
    setNewCategoryName("");
    setIsAddDialogOpen(false);
    toast({
      title: "Category Added",
      description: `Category "${newCategoryName}" has been created.`,
    });
  };

  const handleEditClick = (e: React.MouseEvent, category: Category) => {
    e.stopPropagation();
    setEditingCategory(category);
    setNewCategoryCode(category.code);
    setNewCategoryName(category.name);
    setIsEditDialogOpen(true);
  };

  const handleEditCategory = () => {
    if (!editingCategory || !newCategoryCode.trim() || !newCategoryName.trim()) {
      return;
    }

    // Check for duplicate code (excluding current category)
    if (categoriesList.some(c => c.code === newCategoryCode.trim() && c.id !== editingCategory.id)) {
      toast({
        title: "Duplicate Code",
        description: "A category with this code already exists.",
        variant: "destructive",
      });
      return;
    }

    const updatedCategories = categoriesList.map(c => 
      c.id === editingCategory.id 
        ? { ...c, code: newCategoryCode.trim().padStart(2, '0'), name: newCategoryName.trim() }
        : c
    );

    saveCategories(updatedCategories);
    setEditingCategory(null);
    setNewCategoryCode("");
    setNewCategoryName("");
    setIsEditDialogOpen(false);
    toast({
      title: "Category Updated",
      description: `Category has been updated successfully.`,
    });
  };

  const handleDeleteClick = (e: React.MouseEvent, category: Category) => {
    e.stopPropagation();
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteCategory = () => {
    if (!categoryToDelete) return;

    const assetCount = getCategoryAssetCount(categoryToDelete.code);
    if (assetCount > 0) {
      toast({
        title: "Cannot Delete",
        description: `This category has ${assetCount} assets. Remove or reassign them first.`,
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
      return;
    }

    const updatedCategories = categoriesList.filter(c => c.id !== categoryToDelete.id);
    saveCategories(updatedCategories);
    setCategoryToDelete(null);
    setIsDeleteDialogOpen(false);
    toast({
      title: "Category Deleted",
      description: `Category "${categoryToDelete.name}" has been deleted.`,
    });
  };

  return (
    <MainLayout title="Categories" subtitle="Browse asset categories and items">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {categoriesList.length} categories with {categoriesList.reduce((sum, c) => sum + c.subcategories.length, 0)} item types
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Categories List */}
        <div className="space-y-3">
          {categoriesList.map((category) => {
            const isExpanded = expandedCategories.includes(category.id);
            const assetCount = getCategoryAssetCount(category.code);

            return (
              <div
                key={category.id}
                className="rounded-xl bg-card border border-border shadow-sm overflow-hidden animate-fade-in"
              >
                {/* Category Header */}
                <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="flex items-center gap-4 flex-1"
                  >
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
                  </button>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{assetCount} assets</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleEditClick(e, category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDeleteClick(e, category)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    {category.subcategories.length > 0 && (
                      <button onClick={() => toggleCategory(category.id)}>
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

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

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="categoryCode">Category Code</Label>
              <Input
                id="categoryCode"
                placeholder="e.g., 08"
                value={newCategoryCode}
                onChange={(e) => setNewCategoryCode(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                placeholder="e.g., Electronics"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory} disabled={!newCategoryCode.trim() || !newCategoryName.trim()}>
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update the category code and name.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editCategoryCode">Category Code</Label>
              <Input
                id="editCategoryCode"
                placeholder="e.g., 08"
                value={newCategoryCode}
                onChange={(e) => setNewCategoryCode(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editCategoryName">Category Name</Label>
              <Input
                id="editCategoryName"
                placeholder="e.g., Electronics"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCategory} disabled={!newCategoryCode.trim() || !newCategoryName.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{categoryToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
