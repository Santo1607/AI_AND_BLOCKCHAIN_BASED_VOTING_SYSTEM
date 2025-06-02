import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FileUpload } from "@/components/ui/file-upload";
import { CameraCapture } from "@/components/ui/camera-capture";
import { useToast } from "@/hooks/use-toast";
import { useCitizens } from "@/hooks/use-citizens";
import { insertCitizenSchema, type InsertCitizen } from "@shared/schema";
import { User, MapPin, Camera, Fingerprint, Eye } from "lucide-react";

interface CitizenFormProps {
  onSuccess?: () => void;
}

export function CitizenForm({ onSuccess }: CitizenFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [photoMethod, setPhotoMethod] = useState<"upload" | "camera">("camera");
  const { toast } = useToast();
  const { createCitizen } = useCitizens();

  const form = useForm<InsertCitizen>({
    resolver: zodResolver(insertCitizenSchema),
    defaultValues: {
      name: "",
      aadharNumber: "",
      dateOfBirth: "",
      gender: "male",
      address: "",
      district: "",
      pincode: "",
      photoUrl: undefined
    }
  });

  const formatAadharNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 4) return numbers;
    if (numbers.length <= 8) return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
    return `${numbers.slice(0, 4)}-${numbers.slice(4, 8)}-${numbers.slice(8, 12)}`;
  };

  const handleCameraCapture = (imageData: string) => {
    setCapturedPhoto(imageData);
    setShowCamera(false);
  };

  const convertBase64ToFile = (base64: string, filename: string): File => {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const onSubmit = async (data: InsertCitizen) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      if (photoFile) {
        formData.append('photo', photoFile);
      } else if (capturedPhoto) {
        const photoFile = convertBase64ToFile(capturedPhoto, `citizen_photo_${Date.now()}.jpg`);
        formData.append('photo', photoFile);
      }

      await createCitizen.mutateAsync(formData);
      
      toast({
        title: "Citizen Registered Successfully",
        description: `${data.name} has been added to the system.`,
      });
      
      form.reset();
      setPhotoFile(null);
      setCapturedPhoto(null);
      setShowCamera(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register citizen. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="card-shadow">
      <CardContent className="p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter full name" className="input-focus" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth *</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" className="input-focus" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="aadharNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aadhar Number *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          placeholder="XXXX-XXXX-XXXX"
                          className="input-focus"
                          onChange={(e) => {
                            const formatted = formatAadharNumber(e.target.value);
                            field.onChange(formatted);
                          }}
                          maxLength={14}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="input-focus">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                Address Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complete Address *</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Enter complete address"
                            rows={3}
                            className="input-focus"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="input-focus">
                            <SelectValue placeholder="Select district" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Mumbai">Mumbai</SelectItem>
                          <SelectItem value="Delhi">Delhi</SelectItem>
                          <SelectItem value="Bangalore">Bangalore</SelectItem>
                          <SelectItem value="Chennai">Chennai</SelectItem>
                          <SelectItem value="Kolkata">Kolkata</SelectItem>
                          <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                          <SelectItem value="Pune">Pune</SelectItem>
                          <SelectItem value="Ahmedabad">Ahmedabad</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="pincode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pincode *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          placeholder="Enter 6-digit pincode"
                          className="input-focus"
                          maxLength={6}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200 flex items-center">
                <Camera className="w-5 h-5 mr-2 text-blue-600" />
                Photo Upload
              </h3>
              
              <FileUpload
                onFileSelect={setPhotoFile}
                accept="image/*"
                maxSize={2 * 1024 * 1024} // 2MB
                className="max-w-md"
              />
            </div>

            {/* Biometric Placeholders */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200 flex items-center">
                <Fingerprint className="w-5 h-5 mr-2 text-blue-600" />
                Biometric Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
                  <CardContent className="p-6 text-center">
                    <Fingerprint className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="font-medium text-gray-900 mb-2">Fingerprint Capture</h4>
                    <p className="text-sm text-gray-600 mb-4">Biometric device required</p>
                    <Button type="button" variant="outline" disabled>
                      Coming Soon
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
                  <CardContent className="p-6 text-center">
                    <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="font-medium text-gray-900 mb-2">Facial Recognition</h4>
                    <p className="text-sm text-gray-600 mb-4">Camera capture required</p>
                    <Button type="button" variant="outline" disabled>
                      Coming Soon
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => form.reset()}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>Registering...</>
                ) : (
                  <>Register Citizen</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
