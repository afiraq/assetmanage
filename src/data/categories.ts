import { Category } from "@/types/asset";

export const categories: Category[] = [
  {
    id: "1",
    code: "01",
    name: "Building",
    subcategories: []
  },
  {
    id: "2",
    code: "02",
    name: "Furniture and Fixtures",
    subcategories: [
      { code: "01", name: "Chair" },
      { code: "02", name: "Table" },
      { code: "03", name: "Wardrobe" },
      { code: "04", name: "Clock" },
      { code: "05", name: "Cupboard" },
      { code: "06", name: "Sofa" },
      { code: "07", name: "Locker/Safe" },
      { code: "08", name: "Office Workstation" },
      { code: "09", name: "Partition" },
      { code: "10", name: "Podium" },
      { code: "11", name: "Server Rack" },
      { code: "12", name: "Steel Filing System" },
      { code: "13", name: "Grievance Box" },
      { code: "14", name: "TV Stand" }
    ]
  },
  {
    id: "3",
    code: "03",
    name: "Office Request",
    subcategories: [
      { code: "01", name: "Puncher" },
      { code: "02", name: "Stapler" },
      { code: "03", name: "Calculator" },
      { code: "04", name: "Pen" },
      { code: "05", name: "Pencil" },
      { code: "06", name: "Ruler" },
      { code: "07", name: "Eraser" },
      { code: "08", name: "Sharpener" }
    ]
  },
  {
    id: "4",
    code: "04",
    name: "Machinery or Equipment",
    subcategories: [
      { code: "01", name: "Refrigerator" },
      { code: "02", name: "Water Pump" },
      { code: "03", name: "Phone" },
      { code: "04", name: "TV" },
      { code: "05", name: "Air Condition" },
      { code: "06", name: "Computer Monitor" },
      { code: "07", name: "Computer Mouse" },
      { code: "08", name: "Computer Keyboard" },
      { code: "09", name: "Computer CPU" },
      { code: "10", name: "UPS" },
      { code: "11", name: "Photocopy Machine" },
      { code: "12", name: "Printer" },
      { code: "13", name: "Camera" },
      { code: "14", name: "Attendance Machine" },
      { code: "15", name: "Laptop" },
      { code: "16", name: "Speaker" },
      { code: "17", name: "Pendrive" },
      { code: "18", name: "Binding Machine" },
      { code: "19", name: "Scanner" },
      { code: "20", name: "Paper Cutter" },
      { code: "21", name: "Projector" },
      { code: "22", name: "Touchnet Modem" },
      { code: "23", name: "Audio Recorder" },
      { code: "24", name: "Ethernet Desktop Switch" },
      { code: "25", name: "Shredder" },
      { code: "26", name: "Flip Board" },
      { code: "27", name: "PABX System" },
      { code: "28", name: "Projector Screen" },
      { code: "29", name: "Socket" },
      { code: "30", name: "Server System" },
      { code: "31", name: "Oven" },
      { code: "32", name: "Water Boiler" },
      { code: "33", name: "Fan" },
      { code: "34", name: "Rice Cooker" },
      { code: "35", name: "Antenna" },
      { code: "36", name: "Mic Stand" },
      { code: "37", name: "Juice Maker" },
      { code: "38", name: "Vacuum Cleaner" },
      { code: "39", name: "Notice Board" },
      { code: "40", name: "Cash Counting Machine" },
      { code: "41", name: "Firewall" },
      { code: "42", name: "Hard Disk" },
      { code: "43", name: "Access Control System" },
      { code: "44", name: "Router" },
      { code: "45", name: "Water Dispenser" },
      { code: "46", name: "Sound System" },
      { code: "47", name: "USB Hub" },
      { code: "48", name: "TV Box" },
      { code: "49", name: "Tablet" },
      { code: "50", name: "Smart Panel" },
      { code: "51", name: "Software" },
      { code: "52", name: "Website" },
      { code: "53", name: "Network Adaptor" },
      { code: "54", name: "Server Rack PDU" },
      { code: "55", name: "Conference Camera System" },
      { code: "56", name: "Drill" },
      { code: "57", name: "Drone" },
      { code: "58", name: "Computer System" }
    ]
  },
  {
    id: "5",
    code: "05",
    name: "Vehicle",
    subcategories: []
  },
  {
    id: "6",
    code: "06",
    name: "Tools",
    subcategories: [
      { code: "01", name: "Tool Kit" }
    ]
  },
  {
    id: "7",
    code: "07",
    name: "Holding and Other Equipment",
    subcategories: [
      { code: "01", name: "Plate" },
      { code: "02", name: "Glass" },
      { code: "03", name: "Dustbin" },
      { code: "04", name: "Spoon" },
      { code: "05", name: "Fork" },
      { code: "06", name: "Mug" },
      { code: "07", name: "Small Plate" },
      { code: "08", name: "Cradle" }
    ]
  }
];

export const getCategoryByCode = (code: string) => {
  return categories.find(cat => cat.code === code);
};

export const getSubcategoryByCode = (categoryCode: string, subcategoryCode: string) => {
  const category = getCategoryByCode(categoryCode);
  return category?.subcategories.find(sub => sub.code === subcategoryCode);
};
