import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Asset, Location } from "@/types/asset";
import { useToast } from "@/hooks/use-toast";

// Helper to convert snake_case DB row to camelCase Asset
const dbRowToAsset = (row: any): Asset => ({
  id: row.id,
  assetNumber: row.asset_number || "",
  sapNumber: row.sap_number || "",
  model: row.model || "",
  brand: row.brand || "",
  serial: row.serial || "",
  specification: row.specification || "",
  itemName: row.item_name || "",
  officeNumber: row.office_number || "",
  yearNumber: row.year_number || "",
  categoryNumber: row.category_number || "",
  itemNumber: row.item_number || "",
  sequenceNumber: row.sequence_number || "",
  location: row.location || "",
  sublocation: row.sublocation || "",
  price: Number(row.price) || 0,
  accruedDate: row.accrued_date || "",
  purchaseCode: row.purchase_code || "",
  voucherNumber: row.voucher_number || "",
  deductedAfterAuction: row.deducted_after_auction || false,
  auctionedDate: row.auctioned_date || null,
  tagAttached: row.tag_attached || false,
  quantity: row.quantity || 1,
  comments: row.comments || "",
  assignedTo: row.assigned_to || "",
  createdAt: row.created_at || new Date().toISOString(),
});

// Helper to convert camelCase Asset to snake_case for DB
const assetToDbRow = (asset: Partial<Asset>) => ({
  ...(asset.id && { id: asset.id }),
  ...(asset.assetNumber !== undefined && { asset_number: asset.assetNumber }),
  ...(asset.sapNumber !== undefined && { sap_number: asset.sapNumber }),
  ...(asset.model !== undefined && { model: asset.model }),
  ...(asset.brand !== undefined && { brand: asset.brand }),
  ...(asset.serial !== undefined && { serial: asset.serial }),
  ...(asset.specification !== undefined && { specification: asset.specification }),
  ...(asset.itemName !== undefined && { item_name: asset.itemName }),
  ...(asset.officeNumber !== undefined && { office_number: asset.officeNumber }),
  ...(asset.yearNumber !== undefined && { year_number: asset.yearNumber }),
  ...(asset.categoryNumber !== undefined && { category_number: asset.categoryNumber }),
  ...(asset.itemNumber !== undefined && { item_number: asset.itemNumber }),
  ...(asset.sequenceNumber !== undefined && { sequence_number: asset.sequenceNumber }),
  ...(asset.location !== undefined && { location: asset.location }),
  ...(asset.sublocation !== undefined && { sublocation: asset.sublocation }),
  ...(asset.price !== undefined && { price: asset.price }),
  ...(asset.accruedDate !== undefined && { accrued_date: asset.accruedDate }),
  ...(asset.purchaseCode !== undefined && { purchase_code: asset.purchaseCode }),
  ...(asset.voucherNumber !== undefined && { voucher_number: asset.voucherNumber }),
  ...(asset.deductedAfterAuction !== undefined && { deducted_after_auction: asset.deductedAfterAuction }),
  ...(asset.auctionedDate !== undefined && { auctioned_date: asset.auctionedDate }),
  ...(asset.tagAttached !== undefined && { tag_attached: asset.tagAttached }),
  ...(asset.quantity !== undefined && { quantity: asset.quantity }),
  ...(asset.comments !== undefined && { comments: asset.comments }),
  ...(asset.assignedTo !== undefined && { assigned_to: asset.assignedTo || null }),
});

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAssets = async () => {
    try {
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAssets((data || []).map(dbRowToAsset));
    } catch (error) {
      console.error("Error fetching assets:", error);
      toast({
        title: "Error",
        description: "Failed to load assets.",
        variant: "destructive",
      });
    }
  };

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("name");

      if (error) throw error;
      setLocations(
        (data || []).map((row) => ({
          id: row.id,
          name: row.name,
          sublocations: row.sublocations || [],
        }))
      );
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast({
        title: "Error",
        description: "Failed to load locations.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchAssets(), fetchLocations()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const addAsset = async (asset: Asset) => {
    try {
      const dbData = assetToDbRow(asset);
      const { data, error } = await supabase
        .from("assets")
        .insert([dbData])
        .select()
        .single();

      if (error) throw error;
      setAssets((prev) => [dbRowToAsset(data), ...prev]);
      return { error: null };
    } catch (error) {
      console.error("Error adding asset:", error);
      toast({
        title: "Error",
        description: "Failed to add asset.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const updateAsset = async (id: string, updates: Partial<Asset>) => {
    try {
      const dbData = assetToDbRow(updates);
      const { data, error } = await supabase
        .from("assets")
        .update(dbData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setAssets((prev) =>
        prev.map((asset) => (asset.id === id ? dbRowToAsset(data) : asset))
      );
      return { error: null };
    } catch (error) {
      console.error("Error updating asset:", error);
      toast({
        title: "Error",
        description: "Failed to update asset.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const deleteAsset = async (id: string) => {
    try {
      const { error } = await supabase.from("assets").delete().eq("id", id);

      if (error) throw error;
      setAssets((prev) => prev.filter((asset) => asset.id !== id));
      return { error: null };
    } catch (error) {
      console.error("Error deleting asset:", error);
      toast({
        title: "Error",
        description: "Failed to delete asset.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const addLocation = async (location: Location) => {
    try {
      const { data, error } = await supabase
        .from("locations")
        .insert([{ name: location.name, sublocations: location.sublocations }])
        .select()
        .single();

      if (error) throw error;
      setLocations((prev) =>
        [...prev, { id: data.id, name: data.name, sublocations: data.sublocations || [] }].sort(
          (a, b) => a.name.localeCompare(b.name)
        )
      );
      return { error: null };
    } catch (error) {
      console.error("Error adding location:", error);
      toast({
        title: "Error",
        description: "Failed to add location.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const updateLocation = async (id: string, updates: Partial<Location>) => {
    try {
      const { data, error } = await supabase
        .from("locations")
        .update({ name: updates.name, sublocations: updates.sublocations })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setLocations((prev) =>
        prev
          .map((loc) =>
            loc.id === id ? { id: data.id, name: data.name, sublocations: data.sublocations || [] } : loc
          )
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      return { error: null };
    } catch (error) {
      console.error("Error updating location:", error);
      toast({
        title: "Error",
        description: "Failed to update location.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const deleteLocation = async (id: string) => {
    try {
      const { error } = await supabase.from("locations").delete().eq("id", id);

      if (error) throw error;
      setLocations((prev) => prev.filter((loc) => loc.id !== id));
      return { error: null };
    } catch (error) {
      console.error("Error deleting location:", error);
      toast({
        title: "Error",
        description: "Failed to delete location.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const generateAssetNumber = (
    officeNumber: string,
    yearNumber: string,
    categoryNumber: string,
    itemNumber: string
  ) => {
    const prefix = `${officeNumber}-${yearNumber}-${categoryNumber}-${itemNumber}`;
    const existingAssets = assets.filter((a) => a.assetNumber.startsWith(prefix));
    const nextSequence = (existingAssets.length + 1).toString().padStart(2, "0");
    return `${prefix}-${nextSequence}`;
  };

  const escapeCSVValue = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const exportToCSV = () => {
    if (assets.length === 0) return;

    const headers = [
      "assetNumber", "sapNumber", "itemName", "brand", "model", "serial",
      "specification", "officeNumber", "yearNumber", "categoryNumber",
      "itemNumber", "sequenceNumber", "location", "sublocation", "price",
      "accruedDate", "purchaseCode", "voucherNumber", "deductedAfterAuction",
      "auctionedDate", "tagAttached", "quantity", "comments", "assignedTo"
    ];

    const rows = assets.map((asset) =>
      headers.map((header) => escapeCSVValue(asset[header as keyof Asset])).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assets_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (inQuotes) {
        if (char === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (char === '"') {
          inQuotes = false;
        } else {
          current += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ",") {
          result.push(current);
          current = "";
        } else {
          current += char;
        }
      }
    }
    result.push(current);
    return result;
  };

  const importFromCSV = async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split(/\r?\n/);
          const headers = parseCSVLine(lines[0]).map(h => h.trim());

          const generateUUID = () => {
            if (typeof crypto !== 'undefined' && crypto.randomUUID) {
              return crypto.randomUUID();
            }
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
              const r = Math.random() * 16 | 0;
              const v = c === 'x' ? r : (r & 0x3 | 0x8);
              return v.toString(16);
            });
          };

          const importedAssets: Asset[] = lines
            .slice(1)
            .filter((line) => line.trim())
            .map((line) => {
              const values = parseCSVLine(line);
              const asset: Record<string, unknown> = {};

              headers.forEach((header, index) => {
                const value = values[index]?.trim() || "";
                
                // Handle boolean fields
                if (header === "deductedAfterAuction" || header === "tagAttached") {
                  asset[header] = value.toLowerCase() === "true";
                }
                // Handle numeric fields
                else if (header === "price") {
                  asset[header] = parseFloat(value) || 0;
                }
                else if (header === "quantity") {
                  asset[header] = parseInt(value) || 1;
                }
                // Handle null date fields
                else if (header === "auctionedDate") {
                  asset[header] = value && value !== "null" && value !== "" ? value : null;
                }
                // Skip id and createdAt - generate new ones
                else if (header !== "id" && header !== "createdAt") {
                  asset[header] = value;
                }
              });

              // Always generate new id and createdAt for imports
              asset.id = generateUUID();
              asset.createdAt = new Date().toISOString();

              return asset as unknown as Asset;
            });

          // Insert all imported assets to database
          for (const asset of importedAssets) {
            await addAsset(asset);
          }

          resolve();
        } catch (err) {
          console.error("CSV import error:", err);
          reject(new Error("Failed to parse CSV file"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  return {
    assets,
    locations,
    isLoading,
    addAsset,
    updateAsset,
    deleteAsset,
    addLocation,
    updateLocation,
    deleteLocation,
    generateAssetNumber,
    exportToCSV,
    importFromCSV,
    refetch: async () => {
      await Promise.all([fetchAssets(), fetchLocations()]);
    },
  };
}
