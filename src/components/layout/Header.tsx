import { Bell, Search, LogOut, User, Check, AlertCircle, Info, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const notifications = [
  {
    id: 1,
    title: "Asset Maintenance Due",
    description: "MacBook Pro M1 (AST-001) maintenance is due in 2 days.",
    time: "2 hours ago",
    type: "warning",
    unread: true,
  },
  {
    id: 2,
    title: "New Asset Assigned",
    description: "A new Dell Monitor has been assigned to you.",
    time: "5 hours ago",
    type: "info",
    unread: true,
  },
  {
    id: 3,
    title: "Warranty Expiring",
    description: "iPad Air warranty expires next week.",
    time: "Yesterday",
    type: "alert",
    unread: true,
  },
  {
    id: 4,
    title: "Report Generated",
    description: "The monthly asset inventory report is ready.",
    time: "2 days ago",
    type: "success",
    unread: false,
  },
];

export function Header({ title, subtitle }: HeaderProps) {
  const { user, signOut, role } = useAuth();
  const unreadCount = notifications.filter(n => n.unread).length;

  const getInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case "success":
        return <Check className="h-4 w-4 text-green-500" />;
      case "alert":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 print:hidden">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            className="pl-9 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between border-b p-4">
              <h4 className="font-semibold">Notifications</h4>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-[10px]">
                  {unreadCount} New
                </Badge>
              )}
            </div>
            <ScrollArea className="h-[300px]">
              <div className="flex flex-col">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    className={cn(
                      "flex flex-col gap-1 border-b p-4 text-left transition-colors hover:bg-muted/50",
                      notification.unread && "bg-muted/20"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {getIcon(notification.type)}
                      <span className="text-sm font-medium">{notification.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.description}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {notification.time}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
            <div className="p-2 border-t">
              <Button variant="ghost" className="w-full text-xs h-8">
                Mark all as read
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.email}</p>
                <div className="flex items-center gap-2">
                  <Badge variant={role === "admin" ? "default" : "secondary"} className="text-xs">
                    {role || "user"}
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-destructive" onClick={signOut}>
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
