import { useState } from "react";
import { FileBarChart, Download, Filter, Printer } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAssets } from "@/hooks/useAssets";
import { categories } from "@/data/categories";

type ReportType = "all" | "location" | "category" | "brand" | "auctioned";

export default function Reports() {
  const { assets, locations, exportToCSV } = useAssets();
  const [reportType, setReportType] = useState<ReportType>("all");
  const [filterValue, setFilterValue] = useState<string>("all");

  const getFilteredAssets = () => {
    if (reportType === "all" || filterValue === "all") return assets;

    switch (reportType) {
      case "location":
        return assets.filter((a) => a.location === filterValue);
      case "category":
        return assets.filter((a) => a.categoryNumber === filterValue);
      case "brand":
        return assets.filter((a) => a.brand === filterValue);
      case "auctioned":
        return assets.filter((a) => a.status === 'auctioned');
      default:
        return assets;
    }
  };

  const filteredAssets = getFilteredAssets();
  const uniqueBrands = [...new Set(assets.map((a) => a.brand).filter(Boolean))];

  const getFilterOptions = () => {
    switch (reportType) {
      case "location":
        return locations.map((l) => ({ value: l.name, label: l.name }));
      case "category":
        return categories.map((c) => ({ value: c.code, label: `${c.code} - ${c.name}` }));
      case "brand":
        return uniqueBrands.map((b) => ({ value: b, label: b }));
      default:
        return [];
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <MainLayout title="Reports" subtitle="Generate and export asset reports">
      <div className="space-y-6">
        {/* Report Controls - Hidden when printing */}
        <div className="rounded-xl bg-card border border-border p-6 shadow-sm print:hidden">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex gap-3 flex-wrap">
              <Select value={reportType} onValueChange={(value) => {
                setReportType(value as ReportType);
                setFilterValue("all");
              }}>
                <SelectTrigger className="w-48">
                  <FileBarChart className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Report Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assets</SelectItem>
                  <SelectItem value="location">By Location</SelectItem>
                  <SelectItem value="category">By Category</SelectItem>
                  <SelectItem value="brand">By Brand</SelectItem>
                  <SelectItem value="auctioned">Auctioned Assets</SelectItem>
                </SelectContent>
              </Select>

              {reportType !== "all" && reportType !== "auctioned" && (
                <Select value={filterValue} onValueChange={setFilterValue}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Select filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {getFilterOptions().map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button onClick={exportToCSV} disabled={filteredAssets.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-card border border-border p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Total Assets</p>
            <p className="text-2xl font-bold text-card-foreground">{filteredAssets.length}</p>
          </div>
          <div className="rounded-xl bg-card border border-border p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-2xl font-bold text-card-foreground font-mono">
              MVR {filteredAssets.reduce((sum, a) => sum + a.price, 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl bg-card border border-border p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Tagged Assets</p>
            <p className="text-2xl font-bold text-card-foreground">
              {filteredAssets.filter((a) => a.tagAttached).length}
            </p>
          </div>
        </div>

        {/* Report Table */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden print:shadow-none">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Asset Number</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No assets found for this report
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-mono text-sm">{asset.assetNumber}</TableCell>
                    <TableCell className="font-medium">{asset.itemName}</TableCell>
                    <TableCell>{asset.brand}</TableCell>
                    <TableCell>{asset.model}</TableCell>
                    <TableCell>
                      {asset.location}
                      {asset.sublocation && ` / ${asset.sublocation}`}
                    </TableCell>
                    <TableCell className="font-mono">MVR {asset.price.toLocaleString()}</TableCell>
                    <TableCell>
                      {asset.status === 'auctioned' ? "Auctioned" : asset.tagAttached ? "Tagged" : asset.status || "Active"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
}
