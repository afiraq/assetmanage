import { useState, useEffect, useRef } from "react";
import { User, Shield, Bell, Database, Users, Plus, Pencil, Trash2, UserPlus, KeyRound, Download, Upload, AlertTriangle } from "lucide-react";
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
import { useStaff, Staff } from "@/hooks/useStaff";
import { useAuth } from "@/contexts/AuthContext";
import { useAssets } from "@/hooks/useAssets";

interface SystemUser {
  id: string;
  email: string;
  fullName: string;
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
  const { isAdmin, user } = useAuth();
  const { staff, isLoading: staffLoading, addStaff, updateStaff, deleteStaff } = useStaff();
  const { assets, locations, exportToCSV, importFromCSV, refetch } = useAssets();
  
  // Data Management State
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);
  const backupFileRef = useRef<HTMLInputElement>(null);
  const staffImportFileRef = useRef<HTMLInputElement>(null);
  const [isImportingStaff, setIsImportingStaff] = useState(false);
  
  // Staff Management State
  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false);
  const [isEditStaffDialogOpen, setIsEditStaffDialogOpen] = useState(false);
  const [isDeleteStaffDialogOpen, setIsDeleteStaffDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
  const [staffFormData, setStaffFormData] = useState({
    name: "",
    email: "",
    employee_id: "",
    department: "",
    position: "",
    is_active: true,
  });

  // System Users State
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<SystemUser | null>(null);
  const [userToResetPassword, setUserToResetPassword] = useState<SystemUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [userFormData, setUserFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "user" as "admin" | "user",
  });

  const [ldapConfig, setLdapConfig] = useState<LdapConfig>(defaultLdapConfig);
  const [isLdapDialogOpen, setIsLdapDialogOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Load system users
  const loadSystemUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke("create-user", {
        body: { action: "list" },
      });

      if (error) throw error;
      setSystemUsers(data.users || []);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadSystemUsers();
    }
  }, [isAdmin]);

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

  // CSV parsing helper
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

  // Staff CSV Import
  const handleImportStaffCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImportingStaff(true);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/);
      const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());

      let importedCount = 0;
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = parseCSVLine(line);
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = values[index]?.trim() || "";
        });

        // Map CSV columns to staff fields (flexible column names)
        const name = row.name || row.fullname || row.full_name || row.staffname || "";
        if (!name) continue; // Skip rows without name

        const staffData = {
          name: name,
          email: row.email || row.mail || null,
          employee_id: row.employee_id || row.employeeid || row.emp_id || row.id || null,
          department: row.department || row.dept || null,
          position: row.position || row.title || row.job_title || row.jobtitle || null,
          is_active: row.is_active?.toLowerCase() !== "false" && row.active?.toLowerCase() !== "false",
        };

        const { error } = await addStaff(staffData);
        if (!error) importedCount++;
      }

      toast({
        title: "Import Successful",
        description: `Imported ${importedCount} staff members.`,
      });
    } catch (error) {
      console.error("Staff CSV import error:", error);
      toast({
        title: "Import Failed",
        description: "Failed to import staff from CSV file.",
        variant: "destructive",
      });
    } finally {
      setIsImportingStaff(false);
      if (staffImportFileRef.current) {
        staffImportFileRef.current.value = "";
      }
    }
  };

  // Export Staff to CSV
  const handleExportStaffCSV = () => {
    if (staff.length === 0) return;

    const headers = ["name", "email", "employee_id", "department", "position", "is_active"];
    const rows = staff.map(member => 
      headers.map(h => {
        const value = member[h as keyof typeof member];
        if (value === null || value === undefined) return "";
        const str = String(value);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `staff_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `Exported ${staff.length} staff members.`,
    });
  };

  // Staff Management Functions
  const resetStaffForm = () => {
    setStaffFormData({
      name: "",
      email: "",
      employee_id: "",
      department: "",
      position: "",
      is_active: true,
    });
  };

  const handleAddStaff = async () => {
    if (!staffFormData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a name.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    const { error } = await addStaff({
      name: staffFormData.name.trim(),
      email: staffFormData.email.trim() || null,
      employee_id: staffFormData.employee_id.trim() || null,
      department: staffFormData.department.trim() || null,
      position: staffFormData.position.trim() || null,
      is_active: staffFormData.is_active,
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

    resetStaffForm();
    setIsAddStaffDialogOpen(false);
    toast({
      title: "Staff Added",
      description: `${staffFormData.name} has been added successfully.`,
    });
  };

  const handleEditStaffClick = (member: Staff) => {
    setEditingStaff(member);
    setStaffFormData({
      name: member.name,
      email: member.email || "",
      employee_id: member.employee_id || "",
      department: member.department || "",
      position: member.position || "",
      is_active: member.is_active,
    });
    setIsEditStaffDialogOpen(true);
  };

  const handleEditStaff = async () => {
    if (!editingStaff || !staffFormData.name.trim()) {
      return;
    }

    setIsSaving(true);
    const { error } = await updateStaff(editingStaff.id, {
      name: staffFormData.name.trim(),
      email: staffFormData.email.trim() || null,
      employee_id: staffFormData.employee_id.trim() || null,
      department: staffFormData.department.trim() || null,
      position: staffFormData.position.trim() || null,
      is_active: staffFormData.is_active,
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

    resetStaffForm();
    setEditingStaff(null);
    setIsEditStaffDialogOpen(false);
    toast({
      title: "Staff Updated",
      description: "Staff member has been updated successfully.",
    });
  };

  const handleDeleteStaffClick = (member: Staff) => {
    setStaffToDelete(member);
    setIsDeleteStaffDialogOpen(true);
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
    setIsDeleteStaffDialogOpen(false);
    toast({
      title: "Staff Deleted",
      description: `${staffToDelete.name} has been removed.`,
    });
  };

  // System User Management Functions
  const resetUserForm = () => {
    setUserFormData({
      email: "",
      password: "",
      fullName: "",
      role: "user",
    });
  };

  const handleAddUser = async () => {
    if (!userFormData.email.trim() || !userFormData.password.trim() || !userFormData.fullName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (userFormData.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-user", {
        body: {
          action: "create",
          email: userFormData.email.trim(),
          password: userFormData.password,
          fullName: userFormData.fullName.trim(),
          role: userFormData.role,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      resetUserForm();
      setIsAddUserDialogOpen(false);
      loadSystemUsers();
      toast({
        title: "User Created",
        description: `${userFormData.fullName} can now login with their credentials.`,
      });
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Error",
        description: error.message || "Failed to create user.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditUserClick = (user: SystemUser) => {
    setEditingUser(user);
    setUserFormData({
      email: user.email,
      password: "",
      fullName: user.fullName,
      role: user.role,
    });
    setIsEditUserDialogOpen(true);
  };

  const handleEditUser = async () => {
    if (!editingUser || !userFormData.email.trim() || !userFormData.fullName.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-user", {
        body: {
          action: "update",
          userId: editingUser.id,
          email: userFormData.email.trim(),
          password: userFormData.password || undefined,
          fullName: userFormData.fullName.trim(),
          role: userFormData.role,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      resetUserForm();
      setEditingUser(null);
      setIsEditUserDialogOpen(false);
      loadSystemUsers();
      toast({
        title: "User Updated",
        description: "User has been updated successfully.",
      });
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Error",
        description: error.message || "Failed to update user.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUserClick = (user: SystemUser) => {
    setUserToDelete(user);
    setIsDeleteUserDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const { data, error } = await supabase.functions.invoke("create-user", {
        body: {
          action: "delete",
          userId: userToDelete.id,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setUserToDelete(null);
      setIsDeleteUserDialogOpen(false);
      loadSystemUsers();
      toast({
        title: "User Deleted",
        description: `${userToDelete.fullName} has been removed.`,
      });
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Error",
        description: error.message || "Failed to delete user.",
        variant: "destructive",
      });
    }
  };

  const handleResetPasswordClick = (user: SystemUser) => {
    setUserToResetPassword(user);
    setNewPassword("");
    setIsResetPasswordDialogOpen(true);
  };

  const handleResetPassword = async () => {
    if (!userToResetPassword || !newPassword) return;

    if (newPassword.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-user", {
        body: {
          action: "reset_password",
          userId: userToResetPassword.id,
          password: newPassword,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setUserToResetPassword(null);
      setNewPassword("");
      setIsResetPasswordDialogOpen(false);
      toast({
        title: "Password Reset",
        description: `Password for ${userToResetPassword.fullName} has been reset successfully.`,
      });
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Error",
        description: error.message || "Failed to reset password.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Data Management Functions
  const handleExportData = () => {
    setIsExporting(true);
    try {
      exportToCSV();
      toast({
        title: "Export Successful",
        description: `Exported ${assets.length} assets to CSV file.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleBackupData = () => {
    setIsExporting(true);
    try {
      const backupData = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        assets: assets,
        locations: locations,
        staff: staff,
      };
      
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Backup Successful",
        description: `Backed up ${assets.length} assets, ${locations.length} locations, and ${staff.length} staff members.`,
      });
    } catch (error) {
      toast({
        title: "Backup Failed",
        description: "Failed to create backup.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      await importFromCSV(file);
      await refetch();
      toast({
        title: "Import Successful",
        description: "Assets have been imported successfully.",
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import data from CSV file.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      if (importFileRef.current) {
        importFileRef.current.value = "";
      }
    }
  };

  const handleRestoreBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const backupData = JSON.parse(text);

      if (!backupData.version || !backupData.assets) {
        throw new Error("Invalid backup file format");
      }

      // Import assets
      for (const asset of backupData.assets) {
        const dbData = {
          asset_number: asset.assetNumber || "",
          sap_number: asset.sapNumber || "",
          model: asset.model || "",
          brand: asset.brand || "",
          serial: asset.serial || "",
          specification: asset.specification || "",
          item_name: asset.itemName || "",
          office_number: asset.officeNumber || "",
          year_number: asset.yearNumber || "",
          category_number: asset.categoryNumber || "",
          item_number: asset.itemNumber || "",
          sequence_number: asset.sequenceNumber || "",
          location: asset.location || "",
          sublocation: asset.sublocation || "",
          price: asset.price || 0,
          accrued_date: asset.accruedDate || "",
          purchase_code: asset.purchaseCode || "",
          voucher_number: asset.voucherNumber || "",
          deducted_after_auction: asset.deductedAfterAuction || false,
          auctioned_date: asset.auctionedDate || null,
          tag_attached: asset.tagAttached || false,
          quantity: asset.quantity || 1,
          comments: asset.comments || "",
          assigned_to: asset.assignedTo || null,
          image_url: asset.imageUrl || null,
        };

        await supabase.from("assets").insert([dbData]);
      }

      // Import locations if present
      if (backupData.locations) {
        for (const location of backupData.locations) {
          const { error } = await supabase
            .from("locations")
            .insert([{ name: location.name, sublocations: location.sublocations || [] }]);
          if (error && !error.message.includes("duplicate")) {
            console.warn("Location import warning:", error);
          }
        }
      }

      // Import staff if present
      if (backupData.staff) {
        for (const member of backupData.staff) {
          const { error } = await supabase
            .from("staff")
            .insert([{
              name: member.name,
              email: member.email || null,
              employee_id: member.employee_id || null,
              department: member.department || null,
              position: member.position || null,
              is_active: member.is_active ?? true,
            }]);
          if (error && !error.message.includes("duplicate")) {
            console.warn("Staff import warning:", error);
          }
        }
      }

      await refetch();
      toast({
        title: "Restore Successful",
        description: `Restored ${backupData.assets.length} assets from backup.`,
      });
    } catch (error) {
      console.error("Restore error:", error);
      toast({
        title: "Restore Failed",
        description: "Failed to restore data from backup file. Please check the file format.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      if (backupFileRef.current) {
        backupFileRef.current.value = "";
      }
    }
  };

  const handleClearAllData = async () => {
    setIsClearing(true);
    try {
      // Delete all assets
      const { error: assetsError } = await supabase.from("assets").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (assetsError) throw assetsError;

      await refetch();
      setIsClearDialogOpen(false);
      toast({
        title: "Data Cleared",
        description: "All assets have been deleted.",
      });
    } catch (error) {
      console.error("Clear data error:", error);
      toast({
        title: "Error",
        description: "Failed to clear data.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <MainLayout title="Settings" subtitle="System configuration and preferences">
      <div className="space-y-6 max-w-4xl">
        {/* System Users (Login Users) - Admin Only */}
        {isAdmin && (
        <div className="rounded-xl bg-card border border-border p-6 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-card-foreground">System Users</h3>
                <p className="text-sm text-muted-foreground">Manage users who can login to the system</p>
              </div>
            </div>
            <Button onClick={() => setIsAddUserDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>

          {isLoadingUsers ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading users...
            </div>
          ) : systemUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found. Click "Add User" to create one.
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
                  {systemUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.fullName}</TableCell>
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
                            title="Reset Password"
                            onClick={() => handleResetPasswordClick(user)}
                          >
                            <KeyRound className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditUserClick(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteUserClick(user)}
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
        )}

        {/* Staff Management */}
        <div className="rounded-xl bg-card border border-border p-6 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-card-foreground">Staff Management</h3>
                <p className="text-sm text-muted-foreground">Add staff for asset assignment (no login required)</p>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="file"
                accept=".csv"
                ref={staffImportFileRef}
                onChange={handleImportStaffCSV}
                className="hidden"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => staffImportFileRef.current?.click()}
                disabled={isImportingStaff}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isImportingStaff ? "Importing..." : "Import CSV"}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExportStaffCSV}
                disabled={staff.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={() => setIsAddStaffDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Staff
              </Button>
            </div>
          </div>

          {staffLoading ? (
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
                            onClick={() => handleEditStaffClick(member)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteStaffClick(member)}
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
              <Input id="fullName" defaultValue={user?.user_metadata?.full_name || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user?.email || ""} disabled />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Contact an administrator to update your profile information.
          </p>
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
              <p className="text-sm text-muted-foreground">Backup, restore, and export options</p>
            </div>
          </div>
          
          {/* Export Section */}
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-border">
              <h4 className="font-medium text-card-foreground mb-2">Export Data</h4>
              <p className="text-sm text-muted-foreground mb-3">Download your assets as CSV or create a full backup.</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handleExportData} disabled={isExporting || assets.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? "Exporting..." : `Export CSV (${assets.length} assets)`}
                </Button>
                <Button variant="outline" onClick={handleBackupData} disabled={isExporting}>
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? "Backing up..." : "Full Backup (JSON)"}
                </Button>
              </div>
            </div>

            {/* Import Section */}
            <div className="p-4 rounded-lg border border-border">
              <h4 className="font-medium text-card-foreground mb-2">Import Data</h4>
              <p className="text-sm text-muted-foreground mb-3">Import assets from CSV file or restore from a backup.</p>
              <div className="flex flex-wrap gap-2">
                <input
                  type="file"
                  accept=".csv"
                  ref={importFileRef}
                  onChange={handleImportCSV}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  onClick={() => importFileRef.current?.click()}
                  disabled={isImporting}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isImporting ? "Importing..." : "Import CSV"}
                </Button>
                <input
                  type="file"
                  accept=".json"
                  ref={backupFileRef}
                  onChange={handleRestoreBackup}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  onClick={() => backupFileRef.current?.click()}
                  disabled={isImporting}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isImporting ? "Restoring..." : "Restore Backup"}
                </Button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/5">
              <h4 className="font-medium text-destructive mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Danger Zone
              </h4>
              <p className="text-sm text-muted-foreground mb-3">Permanently delete all asset data. This action cannot be undone.</p>
              <Button 
                variant="destructive" 
                onClick={() => setIsClearDialogOpen(true)}
                disabled={assets.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Assets ({assets.length})
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Add System User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user who can login to the system.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="userFullName">Full Name *</Label>
              <Input
                id="userFullName"
                placeholder="Enter full name"
                value={userFormData.fullName}
                onChange={(e) => setUserFormData(prev => ({ ...prev, fullName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userEmail">Email *</Label>
              <Input
                id="userEmail"
                type="email"
                placeholder="Enter email address"
                value={userFormData.email}
                onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userPassword">Password *</Label>
              <Input
                id="userPassword"
                type="password"
                placeholder="Enter password (min 6 characters)"
                value={userFormData.password}
                onChange={(e) => setUserFormData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userRole">Role</Label>
              <Select 
                value={userFormData.role} 
                onValueChange={(value: "admin" | "user") => setUserFormData(prev => ({ ...prev, role: value }))}
              >
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
            <Button variant="outline" onClick={() => { resetUserForm(); setIsAddUserDialogOpen(false); }}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} disabled={isSaving}>
              {isSaving ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit System User Dialog */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information. Leave password empty to keep current password.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editUserFullName">Full Name *</Label>
              <Input
                id="editUserFullName"
                placeholder="Enter full name"
                value={userFormData.fullName}
                onChange={(e) => setUserFormData(prev => ({ ...prev, fullName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editUserEmail">Email *</Label>
              <Input
                id="editUserEmail"
                type="email"
                placeholder="Enter email address"
                value={userFormData.email}
                onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editUserPassword">New Password (optional)</Label>
              <Input
                id="editUserPassword"
                type="password"
                placeholder="Leave empty to keep current password"
                value={userFormData.password}
                onChange={(e) => setUserFormData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editUserRole">Role</Label>
              <Select 
                value={userFormData.role} 
                onValueChange={(value: "admin" | "user") => setUserFormData(prev => ({ ...prev, role: value }))}
              >
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
            <Button variant="outline" onClick={() => { resetUserForm(); setEditingUser(null); setIsEditUserDialogOpen(false); }}>
              Cancel
            </Button>
            <Button onClick={handleEditUser} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete System User Dialog */}
      <AlertDialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{userToDelete?.fullName}"? This will remove their login access permanently.
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

      {/* Add Staff Dialog */}
      <Dialog open={isAddStaffDialogOpen} onOpenChange={setIsAddStaffDialogOpen}>
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
                value={staffFormData.name}
                onChange={(e) => setStaffFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staffEmail">Email</Label>
              <Input
                id="staffEmail"
                type="email"
                placeholder="Enter email address (optional)"
                value={staffFormData.email}
                onChange={(e) => setStaffFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="staffEmployeeId">Employee ID</Label>
                <Input
                  id="staffEmployeeId"
                  placeholder="e.g., EMP001"
                  value={staffFormData.employee_id}
                  onChange={(e) => setStaffFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staffDepartment">Department</Label>
                <Input
                  id="staffDepartment"
                  placeholder="e.g., IT"
                  value={staffFormData.department}
                  onChange={(e) => setStaffFormData(prev => ({ ...prev, department: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="staffPosition">Position</Label>
              <Input
                id="staffPosition"
                placeholder="e.g., Software Engineer"
                value={staffFormData.position}
                onChange={(e) => setStaffFormData(prev => ({ ...prev, position: e.target.value }))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="staffActive"
                checked={staffFormData.is_active}
                onCheckedChange={(checked) => setStaffFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="staffActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetStaffForm(); setIsAddStaffDialogOpen(false); }}>
              Cancel
            </Button>
            <Button onClick={handleAddStaff} disabled={!staffFormData.name.trim() || isSaving}>
              {isSaving ? "Adding..." : "Add Staff"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={isEditStaffDialogOpen} onOpenChange={setIsEditStaffDialogOpen}>
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
                value={staffFormData.name}
                onChange={(e) => setStaffFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editStaffEmail">Email</Label>
              <Input
                id="editStaffEmail"
                type="email"
                placeholder="Enter email address (optional)"
                value={staffFormData.email}
                onChange={(e) => setStaffFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="editStaffEmployeeId">Employee ID</Label>
                <Input
                  id="editStaffEmployeeId"
                  placeholder="e.g., EMP001"
                  value={staffFormData.employee_id}
                  onChange={(e) => setStaffFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editStaffDepartment">Department</Label>
                <Input
                  id="editStaffDepartment"
                  placeholder="e.g., IT"
                  value={staffFormData.department}
                  onChange={(e) => setStaffFormData(prev => ({ ...prev, department: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editStaffPosition">Position</Label>
              <Input
                id="editStaffPosition"
                placeholder="e.g., Software Engineer"
                value={staffFormData.position}
                onChange={(e) => setStaffFormData(prev => ({ ...prev, position: e.target.value }))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="editStaffActive"
                checked={staffFormData.is_active}
                onCheckedChange={(checked) => setStaffFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="editStaffActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetStaffForm(); setEditingStaff(null); setIsEditStaffDialogOpen(false); }}>
              Cancel
            </Button>
            <Button onClick={handleEditStaff} disabled={!staffFormData.name.trim() || isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Staff Dialog */}
      <AlertDialog open={isDeleteStaffDialogOpen} onOpenChange={setIsDeleteStaffDialogOpen}>
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

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {userToResetPassword?.fullName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword} disabled={isSaving}>
              {isSaving ? "Resetting..." : "Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear All Data Confirmation Dialog */}
      <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete All Assets
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all {assets.length} assets? This action cannot be undone.
              We recommend creating a backup before proceeding.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearing}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClearAllData} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isClearing}
            >
              {isClearing ? "Deleting..." : "Delete All Assets"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
