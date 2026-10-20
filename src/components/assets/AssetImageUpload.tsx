import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AssetImageUploadProps {
  imageUrl: string | null;
  onImageChange: (url: string | null) => void;
  assetId?: string;
}

export function AssetImageUpload({ imageUrl, onImageChange, assetId }: AssetImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${assetId || crypto.randomUUID()}-${Date.now()}.${fileExt}`;
      const filePath = `assets/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("asset-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("asset-images")
        .getPublicUrl(filePath);

      onImageChange(publicUrl);
      toast({
        title: "Image Uploaded",
        description: "Asset image has been uploaded successfully.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = async () => {
    if (!imageUrl) return;

    try {
      // Extract file path from URL
      const urlParts = imageUrl.split("/asset-images/");
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from("asset-images").remove([filePath]);
      }
      onImageChange(null);
      toast({
        title: "Image Removed",
        description: "Asset image has been removed.",
      });
    } catch (error) {
      console.error("Remove error:", error);
      onImageChange(null);
    }
  };

  return (
    <div className="space-y-3">
      <Label>Asset Image</Label>
      {imageUrl ? (
        <div className="relative w-full max-w-xs">
          <img
            src={imageUrl}
            alt="Asset"
            className="w-full h-48 object-cover rounded-lg border border-border"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full max-w-xs h-48 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-sm">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImageIcon className="h-10 w-10" />
              <span className="text-sm font-medium">Click to upload image</span>
              <span className="text-xs">PNG, JPG up to 5MB</span>
            </div>
          )}
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={uploading}
      />
    </div>
  );
}
