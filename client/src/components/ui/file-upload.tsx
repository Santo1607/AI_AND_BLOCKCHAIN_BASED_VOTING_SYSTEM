import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Upload, X, FileImage } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // in bytes
  className?: string;
}

export function FileUpload({ 
  onFileSelect, 
  accept = "image/*", 
  maxSize = 2 * 1024 * 1024, // 2MB default
  className 
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File | null) => {
    setError(null);
    
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      onFileSelect(null);
      return;
    }

    // Validate file type
    if (accept === "image/*" && !file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const clearFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
        className="hidden"
      />

      {!selectedFile ? (
        <Card 
          className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Citizen Photo</h4>
            <p className="text-gray-600 mb-4">Drag and drop or click to select image</p>
            <Button type="button" className="btn-primary">
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              JPG, PNG up to {Math.round(maxSize / (1024 * 1024))}MB
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileImage className="w-8 h-8 text-gray-400" />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                {previewUrl && (
                  <p className="text-xs text-green-600 mt-1">Preview ready</p>
                )}
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFile}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}
    </div>
  );
}
