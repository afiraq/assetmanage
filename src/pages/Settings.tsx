import { useState, useEffect } from "react";
import { User, Shield, Bell, Database, Users, Plus, Pencil, Trash2 } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useStaff, Staff } from "@/hooks/useStaff";

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
  const { staff, isLoading, addStaff, updateStaff, deleteStaff } = useStaff();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLdapDialogOpen, setIsLdapDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    employee_id: "",
    department: "",
    position: "",
    is_active: true,
  });
  const [ldapConfig, setLdapConfig] = useState<LdapConfig>(defaultLdapConfig);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Load LDAP config from localStorage
  useEffect(() => {
    const storedLdap = localStorage.getItem("ldapConfig");
    if (storedLdap) {
      setLdapConfig(JSON.parse(storedLdap));
    }
  }, []);

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

    if (!ldapConfig.bindDn || !ldapConfig.bindPassword) {
      toast({
        title: "Validation Error",
        description: "Please enter Bind DN and password for connection test.",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ldap-auth', {
        body: {
          action: 'test',
          serverUrl: ldapConfig.serverUrl,
          baseDn: ldapConfig.baseDn,
          bindDn: ldapConfig.bindDn,
          bindPassword: ldapConfig.bindPassword,
          userFilter: ldapConfig.userFilter,
        }
      });

      if (error) {
        toast({
          title: "Connection Failed",
          description: error.message || "Failed to connect to LDAP server.",
          variant: "destructive",
        });
      } else if (data?.success) {
        toast({
          title: "Connection Successful",
          description: data.message || "Successfully connected to LDAP server.",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: data?.message || "Failed to connect to LDAP server.",
          variant: "destructive",
        });
      }
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Connection Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      employee_id: "",
      department: "",
      position: "",
      is_active: true,
    });
  };

  const handleAddStaff = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a name.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    const { error } = await addStaff({
      name: formData.name.trim(),
      email: formData.email.trim() || null,
      employee_id: formData.employee_id.trim() || null,
      department: formData.department.trim() || null,
      position: formData.position.trim() || null,
      is_active: formData.is_active,
    });

    setIsSaving(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add staff member.",
        variant: "destructive",
      });
      return;
    }

    resetForm();
    setIsAddDialogOpen(false);
    toast({
      title: "Staff Added",
      description: `${formData.name} has been added successfully.`,
    });
  };

  const handleEditClick = (member: Staff) => {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      email: member.email || "",
      employee_id: member.employee_id || "",
      department: member.department || "",
      position: member.position || "",
      is_active: member.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditStaff = async () => {
    if (!editingStaff || !formData.name.trim()) {
      return;
    }

    setIsSaving(true);
    const { error } = await updateStaff(editingStaff.id, {
      name: formData.name.trim(),
      email: formData.email.trim() || null,
      employee_id: formData.employee_id.trim() || null,
      department: formData.department.trim() || null,
      position: formData.position.trim() || null,
      is_active: formData.is_active,
    });

    setIsSaving(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update staff member.",
        variant: "destructive",
      });
      return;
    }

    resetForm();
    setEditingStaff(null);
    setIsEditDialogOpen(false);
    toast({
      title: "Staff Updated",
      description: "Staff member has been updated successfully.",
    });
  };

  const handleDeleteClick = (member: Staff) => {
    setStaffToDelete(member);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteStaff = async () => {
    if (!staffToDelete) return;

    const { error } = await deleteStaff(staffToDelete.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete staff member.",
        variant: "destructive",
      });
      return;
    }

    setStaffToDelete(null);
    setIsDeleteDialogOpen(false);
    toast({
      title: "Staff Deleted",
      description: `${staffToDelete.name} has been removed.`,
    });
  };

  return (
    <MainLayout title="Settings" subtitle="System configuration and preferences">
      <div className="space-y-6 max-w-4xl">
        {/* Staff Management */}
        <div className="rounded-xl bg-card border border-border p-6 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-card-foreground">Staff Management</h3>
                <p className="text-sm text-muted-foreground">Add and manage staff for asset assignment</p>
              </div>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Staff
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading staff members...
            </div>
          ) : staff.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No staff added yet. Click "Add Staff" to create one.
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          {member.email && (
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{member.employee_id || "-"}</TableCell>
                      <TableCell>{member.department || "-"}</TableCell>
                      <TableCell>{member.position || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={member.is_active ? "default" : "secondary"}>
                          {member.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(member)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(member)}
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

      {/* Add Staff Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Staff</DialogTitle>
            <DialogDescription>Create a new staff member for asset assignment.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="staffName">Name *</Label>
              <Input
                id="staffName"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staffEmail">Email</Label>
              <Input
                id="staffEmail"
                type="email"
                placeholder="Enter email address (optional)"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="staffEmployeeId">Employee ID</Label>
                <Input
                  id="staffEmployeeId"
                  placeholder="e.g., EMP001"
                  value={formData.employee_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staffDepartment">Department</Label>
                <Input
                  id="staffDepartment"
                  placeholder="e.g., IT"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="staffPosition">Position</Label>
              <Input
                id="staffPosition"
                placeholder="e.g., Software Engineer"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="staffActive"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="staffActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setIsAddDialogOpen(false); }}>
              Cancel
            </Button>
            <Button onClick={handleAddStaff} disabled={!formData.name.trim() || isSaving}>
              {isSaving ? "Adding..." : "Add Staff"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Staff</DialogTitle>
            <DialogDescription>Update staff member information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editStaffName">Name *</Label>
              <Input
                id="editStaffName"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editStaffEmail">Email</Label>
              <Input
                id="editStaffEmail"
                type="email"
                placeholder="Enter email address (optional)"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="editStaffEmployeeId">Employee ID</Label>
                <Input
                  id="editStaffEmployeeId"
                  placeholder="e.g., EMP001"
                  value={formData.employee_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editStaffDepartment">Department</Label>
                <Input
                  id="editStaffDepartment"
                  placeholder="e.g., IT"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editStaffPosition">Position</Label>
              <Input
                id="editStaffPosition"
                placeholder="e.g., Software Engineer"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="editStaffActive"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="editStaffActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setEditingStaff(null); setIsEditDialogOpen(false); }}>
              Cancel
            </Button>
            <Button onClick={handleEditStaff} disabled={!formData.name.trim() || isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Staff</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{staffToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStaff} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
