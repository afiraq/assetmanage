import { Bell, Search, LogOut, User, Check, AlertCircle, Info } from "lucide-react";
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
import { useState } from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    title: "New Asset Assigned",
    description: "MacBook Pro M2 has been assigned to you.",
    time: "2 hours ago",
    read: false,
    type: "info"
  },
  {
    id: "2",
    title: "Maintenance Due",
    description: "Dell Monitor requires scheduled maintenance.",
    time: "5 hours ago",
    read: false,
    type: "warning"
  },
  {
    id: "3",
    title: "Request Approved",
    description: "Your request for a new office chair has been approved.",
    time: "Yesterday",
    read: true,
    type: "success"
  }
];

export function Header({ title, subtitle }: HeaderProps) {
  const { user, signOut, role } = useAuth();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
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
              <h4 className="font-semibold text-sm">Notifications</h4>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-8 px-2"
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </Button>
              )}
            </div>
            <ScrollArea className="h-[300px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <p className="text-sm text-muted-foreground">No notifications</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer ${!n.read ? 'bg-muted/20' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className="mt-1">
                          {n.type === 'info' && <Info className="h-4 w-4 text-blue-500" />}
                          {n.type === 'warning' && <AlertCircle className="h-4 w-4 text-amber-500" />}
                          {n.type === 'success' && <Check className="h-4 w-4 text-emerald-500" />}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className={`text-xs font-medium leading-none ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {n.description}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase">
                            {n.time}
                          </p>
                        </div>
                        {!n.read && (
                          <div className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <div className="border-t p-2 text-center">
              <Button variant="ghost" size="sm" className="w-full text-xs font-normal">
                View all notifications
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
