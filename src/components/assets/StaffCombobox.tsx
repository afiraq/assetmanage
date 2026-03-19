import { useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Staff } from "@/hooks/useStaff";

interface StaffComboboxProps {
  staff: Staff[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function StaffCombobox({ staff, value, onValueChange, disabled }: StaffComboboxProps) {
  const [open, setOpen] = useState(false);

  const selectedStaff = staff.find((s) => s.id === value);
  const displayText = selectedStaff
    ? `${selectedStaff.name}${selectedStaff.department ? ` (${selectedStaff.department})` : ""}`
    : "Select staff member";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal h-10"
        >
          <span className="truncate">{displayText}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search staff..." />
          <CommandList>
            <CommandEmpty>No staff found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="__none__"
                onSelect={() => {
                  onValueChange("");
                  setOpen(false);
                }}
              >
                <Check className={cn("mr-2 h-4 w-4", !value ? "opacity-100" : "opacity-0")} />
                Not Assigned
              </CommandItem>
              {staff.map((member) => (
                <CommandItem
                  key={member.id}
                  value={`${member.name} ${member.department || ""} ${member.employee_id || ""}`}
                  onSelect={() => {
                    onValueChange(member.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === member.id ? "opacity-100" : "opacity-0")} />
                  {member.name}
                  {member.department && (
                    <span className="ml-1 text-muted-foreground">({member.department})</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
