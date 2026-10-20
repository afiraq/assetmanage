import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Staff {
  id: string;
  name: string;
  email: string | null;
  employee_id: string | null;
  department: string | null;
  position: string | null;
  is_active: boolean;
  created_at: string;
}

export function useStaff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .order("name");

      if (error) throw error;
      setStaff(data || []);
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast({
        title: "Error",
        description: "Failed to load staff members.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const addStaff = async (staffData: Omit<Staff, "id" | "created_at">) => {
    try {
      const { data, error } = await supabase
        .from("staff")
        .insert([staffData])
        .select()
        .single();

      if (error) throw error;
      setStaff((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      return { data, error: null };
    } catch (error) {
      console.error("Error adding staff:", error);
      return { data: null, error };
    }
  };

  const updateStaff = async (id: string, updates: Partial<Staff>) => {
    try {
      const { data, error } = await supabase
        .from("staff")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setStaff((prev) =>
        prev.map((s) => (s.id === id ? data : s)).sort((a, b) => a.name.localeCompare(b.name))
      );
      return { data, error: null };
    } catch (error) {
      console.error("Error updating staff:", error);
      return { data: null, error };
    }
  };

  const deleteStaff = async (id: string) => {
    try {
      const { error } = await supabase.from("staff").delete().eq("id", id);

      if (error) throw error;
      setStaff((prev) => prev.filter((s) => s.id !== id));
      return { error: null };
    } catch (error) {
      console.error("Error deleting staff:", error);
      return { error };
    }
  };

  const activeStaff = staff.filter((s) => s.is_active);

  return {
    staff,
    activeStaff,
    isLoading,
    addStaff,
    updateStaff,
    deleteStaff,
    refetch: fetchStaff,
  };
}
