import { useState, useEffect } from "react";
import { Asset, Location } from "@/types/asset";

const STORAGE_KEY = "asset_management_assets";
const LOCATIONS_KEY = "asset_management_locations";

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage
    const storedAssets = localStorage.getItem(STORAGE_KEY);
    const storedLocations = localStorage.getItem(LOCATIONS_KEY);
    
    if (storedAssets) {
      setAssets(JSON.parse(storedAssets));
    }
    
    if (storedLocations) {
      setLocations(JSON.parse(storedLocations));
    } else {
      // Default locations
      const defaultLocations: Location[] = [
        { id: "1", name: "Head Office", sublocations: ["Floor 1", "Floor 2", "Floor 3"] },
        { id: "2", name: "Branch Office", sublocations: ["Main Hall", "Storage"] },
        { id: "3", name: "Warehouse", sublocations: ["Section A", "Section B", "Section C"] },
      ];
      setLocations(defaultLocations);
      localStorage.setItem(LOCATIONS_KEY, JSON.stringify(defaultLocations));
    }
    
    setIsLoading(false);
  }, []);

  const addAsset = (asset: Asset) => {
    const newAssets = [...assets, asset];
    setAssets(newAssets);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAssets));
  };

  const updateAsset = (id: string, updates: Partial<Asset>) => {
    const newAssets = assets.map((asset) =>
      asset.id === id ? { ...asset, ...updates } : asset
    );
    setAssets(newAssets);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAssets));
  };

  const deleteAsset = (id: string) => {
    const newAssets = assets.filter((asset) => asset.id !== id);
    setAssets(newAssets);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAssets));
  };

  const addLocation = (location: Location) => {
    const newLocations = [...locations, location];
    setLocations(newLocations);
    localStorage.setItem(LOCATIONS_KEY, JSON.stringify(newLocations));
  };

  const updateLocation = (id: string, updates: Partial<Location>) => {
    const newLocations = locations.map((loc) =>
      loc.id === id ? { ...loc, ...updates } : loc
    );
    setLocations(newLocations);
    localStorage.setItem(LOCATIONS_KEY, JSON.stringify(newLocations));
  };

  const deleteLocation = (id: string) => {
    const newLocations = locations.filter((loc) => loc.id !== id);
    setLocations(newLocations);
    localStorage.setItem(LOCATIONS_KEY, JSON.stringify(newLocations));
  };

  const generateAssetNumber = (
    officeNumber: string,
    yearNumber: string,
    categoryNumber: string,
    itemNumber: string
  ) => {
    // Find next sequence number for this combination
    const prefix = `${officeNumber}-${yearNumber}-${categoryNumber}-${itemNumber}`;
    const existingAssets = assets.filter((a) => a.assetNumber.startsWith(prefix));
    const nextSequence = (existingAssets.length + 1).toString().padStart(2, "0");
    return `${prefix}-${nextSequence}`;
  };

  const exportToCSV = () => {
    if (assets.length === 0) return;
    
    const headers = Object.keys(assets[0]).join(",");
    const rows = assets.map((asset) =>
      Object.values(asset)
        .map((value) => `"${value}"`)
        .join(",")
    );
    const csv = [headers, ...rows].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assets_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFromCSV = (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split("\n");
          const headers = lines[0].split(",");
          
          const importedAssets: Asset[] = lines.slice(1).filter(line => line.trim()).map((line) => {
            const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
            const asset: Record<string, string | number | boolean> = {};
            
            headers.forEach((header, index) => {
              const value = values[index]?.replace(/^"|"$/g, "") || "";
              asset[header.trim()] = value;
            });
            
            return asset as unknown as Asset;
          });
          
          const newAssets = [...assets, ...importedAssets];
          setAssets(newAssets);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newAssets));
          resolve();
        } catch {
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
  };
}
