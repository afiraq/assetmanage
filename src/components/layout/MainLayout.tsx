import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function MainLayout({ children, title, subtitle }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background print:bg-white">
      <Sidebar />
      <div className="pl-64 print:pl-0">
        <Header title={title} subtitle={subtitle} />
        <main className="p-6 print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
