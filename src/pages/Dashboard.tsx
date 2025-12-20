import { Package, Banknote, Tag, AlertTriangle } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentAssets } from "@/components/dashboard/RecentAssets";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { useAssets } from "@/hooks/useAssets";

export default function Dashboard() {
  const { assets, isLoading } = useAssets();

  const totalAssets = assets.length;
  const totalValue = assets.reduce((sum, asset) => sum + (asset.price || 0), 0);
  const taggedAssets = assets.filter((a) => a.tagAttached).length;
  const auctionedAssets = assets.filter((a) => a.deductedAfterAuction).length;

  if (isLoading) {
    return (
      <MainLayout title="Dashboard" subtitle="Asset Management Overview">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Dashboard" subtitle="Asset Management Overview">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Assets"
            value={totalAssets.toLocaleString()}
            change="+12 this month"
            changeType="positive"
            icon={Package}
          />
          <StatCard
            title="Total Value"
            value={`MVR ${totalValue.toLocaleString()}`}
            change="Updated today"
            changeType="neutral"
            icon={Banknote}
            iconColor="gradient-primary"
          />
          <StatCard
            title="Tagged Assets"
            value={taggedAssets.toLocaleString()}
            change={`${totalAssets > 0 ? Math.round((taggedAssets / totalAssets) * 100) : 0}% tagged`}
            changeType="positive"
            icon={Tag}
          />
          <StatCard
            title="Deducted (Auction)"
            value={auctionedAssets.toLocaleString()}
            change="After auction"
            changeType="neutral"
            icon={AlertTriangle}
          />
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentAssets assets={assets} />
          </div>
          <div>
            <CategoryBreakdown assets={assets} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
