import { Package, Banknote, CheckCircle, Trash2, ShieldAlert, Gavel, ArrowRightLeft } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentAssets } from "@/components/dashboard/RecentAssets";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { useAssets } from "@/hooks/useAssets";

export default function Dashboard() {
  const { assets, isLoading } = useAssets();

  // Status counts
  const activeAssets = assets.filter((a) => a.status === 'active' || !a.status);
  const transferredAssets = assets.filter((a) => a.status === 'transferred');
  const discardedAssets = assets.filter((a) => a.status === 'discarded');
  const stolenAssets = assets.filter((a) => a.status === 'stolen');
  const auctionedAssets = assets.filter((a) => a.status === 'auctioned' || a.deductedAfterAuction);

  // Total value for active assets only
  const activeValue = activeAssets.reduce((sum, asset) => sum + (asset.price || 0), 0);

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
            title="Active Assets"
            value={activeAssets.length.toLocaleString()}
            icon={CheckCircle}
            iconColor="bg-emerald-500"
          />
          <StatCard
            title="Active Value"
            value={`MVR ${activeValue.toLocaleString()}`}
            icon={Banknote}
            iconColor="bg-primary"
          />
          <StatCard
            title="Discarded"
            value={discardedAssets.length.toLocaleString()}
            icon={Trash2}
            iconColor="bg-slate-500"
          />
          <StatCard
            title="Stolen"
            value={stolenAssets.length.toLocaleString()}
            icon={ShieldAlert}
            iconColor="bg-red-500"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Auctioned"
            value={auctionedAssets.length.toLocaleString()}
            icon={Gavel}
            iconColor="bg-amber-500"
          />
          <StatCard
            title="Transferred"
            value={transferredAssets.length.toLocaleString()}
            icon={ArrowRightLeft}
            iconColor="bg-blue-500"
          />
          <StatCard
            title="Total Assets"
            value={assets.length.toLocaleString()}
            icon={Package}
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
