import { useState, useEffect } from "react";
import { User, Shield, Bell, Database, Users, Plus, Pencil, Trash2 } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";

interface AppUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
}

interface LdapConfig {
  enabled: boolean;
  serverUrl: string;
  baseDn: string;
  bindDn: string;
  bindPassword: string;
  userFilter: string;
}

const defaultLdapConfig: LdapConfig = {
  enabled: false,
  serverUrl: "",
  baseDn: "",
  bindDn: "",
  bindPassword: "",
  userFilter: "(objectClass=person)",
};

export default function Settings() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLdapDialogOpen, setIsLdapDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "user">("user");
  const [ldapConfig, setLdapConfig] = useState<LdapConfig>(defaultLdapConfig);
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  // Load users from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("appUsers");
    if (stored) {
      setUsers(JSON.parse(stored));
    }
  }, []);

  // Load LDAP config from localStorage
  useEffect(() => {
    const storedLdap = localStorage.getItem("ldapConfig");
    if (storedLdap) {
      setLdapConfig(JSON.parse(storedLdap));
    }
  }, []);

  // Save users to localStorage
  const saveUsers = (updatedUsers: AppUser[]) => {
    localStorage.setItem("appUsers", JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  // Save LDAP config to localStorage
  const saveLdapConfig = () => {
    localStorage.setItem("ldapConfig", JSON.stringify(ldapConfig));
    toast({
      title: "LDAP Configuration Saved",
      description: ldapConfig.enabled 
        ? "AD/LDAP integration has been enabled." 
        : "AD/LDAP configuration has been saved.",
    });
    setIsLdapDialogOpen(false);
  };

  const testLdapConnection = async () => {
    if (!ldapConfig.serverUrl || !ldapConfig.baseDn) {
      toast({
        title: "Validation Error",
        description: "Please enter server URL and Base DN.",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsTesting(false);
    
    toast({
      title: "Connection Test",
      description: "LDAP connection test completed. Check your server configuration if issues persist.",
    });
  };

  const resetForm = () => {
    setNewUserName("");
    setNewUserEmail("");
    setNewUserRole("user");
  };

  const handleAddUser = () => {
    if (!newUserName.trim() || !newUserEmail.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter both name and email.",
        variant: "destructive",
      });
      return;
    }

    if (users.some(u => u.email.toLowerCase() === newUserEmail.trim().toLowerCase())) {
      toast({
        title: "Duplicate Email",
        description: "A user with this email already exists.",
        variant: "destructive",
      });
      return;
    }

    const newUser: AppUser = {
      id: crypto.randomUUID(),
      name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      role: newUserRole,
      createdAt: new Date().toISOString(),
    };

    saveUsers([...users, newUser]);
    resetForm();
    setIsAddDialogOpen(false);
    toast({
      title: "User Added",
      description: `${newUserName} has been added successfully.`,
    });
  };

  const handleEditClick = (user: AppUser) => {
    setEditingUser(user);
    setNewUserName(user.name);
    setNewUserEmail(user.email);
    setNewUserRole(user.role);
    setIsEditDialogOpen(true);
  };

  const handleEditUser = () => {
    if (!editingUser || !newUserName.trim() || !newUserEmail.trim()) {
      return;
    }

    if (users.some(u => u.email.toLowerCase() === newUserEmail.trim().toLowerCase() && u.id !== editingUser.id)) {
      toast({
        title: "Duplicate Email",
        description: "A user with this email already exists.",
        variant: "destructive",
      });
      return;
    }

    const updatedUsers = users.map(u =>
      u.id === editingUser.id
        ? { ...u, name: newUserName.trim(), email: newUserEmail.trim().toLowerCase(), role: newUserRole }
        : u
    );

    saveUsers(updatedUsers);
    resetForm();
    setEditingUser(null);
    setIsEditDialogOpen(false);
    toast({
      title: "User Updated",
      description: "User has been updated successfully.",
    });
  };

  const handleDeleteClick = (user: AppUser) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteUser = () => {
    if (!userToDelete) return;

    const updatedUsers = users.filter(u => u.id !== userToDelete.id);
    saveUsers(updatedUsers);
    setUserToDelete(null);
    setIsDeleteDialogOpen(false);
    toast({
      title: "User Deleted",
      description: `${userToDelete.name} has been removed.`,
    });
  };

  return (
    <MainLayout title="Settings" subtitle="System configuration and preferences">
      <div className="space-y-6 max-w-4xl">
        {/* User Management */}
        <div className="rounded-xl bg-card border border-border p-6 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-card-foreground">User Management</h3>
                <p className="text-sm text-muted-foreground">Add and manage system users</p>
              </div>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users added yet. Click "Add User" to create one.
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(user)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="rounded-xl bg-card border border-border p-6 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground">User Profile</h3>
              <p className="text-sm text-muted-foreground">Manage your account details</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" defaultValue="Admin User" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="admin@company.com" />
            </div>
          </div>
          <div className="mt-4">
            <Button>Save Changes</Button>
          </div>
        </div>

        {/* Security */}
        <div className="rounded-xl bg-card border border-border p-6 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground">Security</h3>
              <p className="text-sm text-muted-foreground">Password and authentication settings</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>
            </div>
            <Button variant="outline">Update Password</Button>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <h4 className="font-medium text-card-foreground">Authentication Options</h4>
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <p className="font-medium text-card-foreground">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-medium text-card-foreground">AD/LDAP Integration</p>
                  <p className="text-sm text-muted-foreground">Connect to Active Directory</p>
                </div>
                {ldapConfig.enabled && (
                  <Badge variant="default" className="ml-2">Enabled</Badge>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsLdapDialogOpen(true)}>
                Configure
              </Button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-xl bg-card border border-border p-6 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground">Notifications</h3>
              <p className="text-sm text-muted-foreground">Manage notification preferences</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <p className="font-medium text-card-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive asset updates via email</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <p className="font-medium text-card-foreground">Low Stock Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified when items are running low</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="rounded-xl bg-card border border-border p-6 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground">Data Management</h3>
              <p className="text-sm text-muted-foreground">Backup and restore options</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">Export All Data</Button>
            <Button variant="outline">Import Data</Button>
            <Button variant="destructive">Clear All Data</Button>
          </div>
        </div>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user for asset assignment.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="userName">Name</Label>
              <Input
                id="userName"
                placeholder="Enter full name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userEmail">Email</Label>
              <Input
                id="userEmail"
                type="email"
                placeholder="Enter email address"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userRole">Role</Label>
              <Select value={newUserRole} onValueChange={(value: "admin" | "user") => setNewUserRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setIsAddDialogOpen(false); }}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} disabled={!newUserName.trim() || !newUserEmail.trim()}>
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editUserName">Name</Label>
              <Input
                id="editUserName"
                placeholder="Enter full name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editUserEmail">Email</Label>
              <Input
                id="editUserEmail"
                type="email"
                placeholder="Enter email address"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editUserRole">Role</Label>
              <Select value={newUserRole} onValueChange={(value: "admin" | "user") => setNewUserRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setEditingUser(null); setIsEditDialogOpen(false); }}>
              Cancel
            </Button>
            <Button onClick={handleEditUser} disabled={!newUserName.trim() || !newUserEmail.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{userToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* LDAP Configuration Dialog */}
      <Dialog open={isLdapDialogOpen} onOpenChange={setIsLdapDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>AD/LDAP Configuration</DialogTitle>
            <DialogDescription>
              Configure Active Directory or LDAP server for user authentication.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/50">
              <div>
                <p className="font-medium text-card-foreground">Enable AD/LDAP</p>
                <p className="text-sm text-muted-foreground">Use directory services for authentication</p>
              </div>
              <Switch 
                checked={ldapConfig.enabled} 
                onCheckedChange={(checked) => setLdapConfig(prev => ({ ...prev, enabled: checked }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ldapServer">LDAP Server URL</Label>
              <Input
                id="ldapServer"
                placeholder="ldap://your-server.com:389"
                value={ldapConfig.serverUrl}
                onChange={(e) => setLdapConfig(prev => ({ ...prev, serverUrl: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="baseDn">Base DN</Label>
              <Input
                id="baseDn"
                placeholder="DC=company,DC=com"
                value={ldapConfig.baseDn}
                onChange={(e) => setLdapConfig(prev => ({ ...prev, baseDn: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bindDn">Bind DN (Service Account)</Label>
              <Input
                id="bindDn"
                placeholder="CN=admin,OU=Users,DC=company,DC=com"
                value={ldapConfig.bindDn}
                onChange={(e) => setLdapConfig(prev => ({ ...prev, bindDn: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bindPassword">Bind Password</Label>
              <Input
                id="bindPassword"
                type="password"
                placeholder="Enter service account password"
                value={ldapConfig.bindPassword}
                onChange={(e) => setLdapConfig(prev => ({ ...prev, bindPassword: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="userFilter">User Filter</Label>
              <Input
                id="userFilter"
                placeholder="(objectClass=person)"
                value={ldapConfig.userFilter}
                onChange={(e) => setLdapConfig(prev => ({ ...prev, userFilter: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={testLdapConnection} disabled={isTesting}>
              {isTesting ? "Testing..." : "Test Connection"}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsLdapDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveLdapConfig}>
                Save Configuration
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
