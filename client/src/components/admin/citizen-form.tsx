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
  const [fingerprintData, setFingerprintData] = useState<string | null>(null);
  const [showFingerprintScanner, setShowFingerprintScanner] = useState(false);
  const [scanningProgress, setScanningProgress] = useState(0);
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

  const startFingerprintScan = () => {
    setScanningProgress(0);
    const interval = setInterval(() => {
      setScanningProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
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
      setFingerprintData(null);
      setShowFingerprintScanner(false);
      setScanningProgress(0);
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
                        <Input 
                          {...field} 
                          type="date" 
                          className="input-focus"
                          max={new Date().toISOString().split('T')[0]}
                          min="1900-01-01"
                        />
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
                  name="constituency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Constituency *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="input-focus">
                            <SelectValue placeholder="Select constituency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Central Delhi">Central Delhi</SelectItem>
                          <SelectItem value="East Delhi">East Delhi</SelectItem>
                          <SelectItem value="North Delhi">North Delhi</SelectItem>
                          <SelectItem value="South Delhi">South Delhi</SelectItem>
                          <SelectItem value="West Delhi">West Delhi</SelectItem>
                          <SelectItem value="Mumbai North">Mumbai North</SelectItem>
                          <SelectItem value="Mumbai South">Mumbai South</SelectItem>
                          <SelectItem value="Mumbai Central">Mumbai Central</SelectItem>
                          <SelectItem value="Bangalore North">Bangalore North</SelectItem>
                          <SelectItem value="Bangalore South">Bangalore South</SelectItem>
                          <SelectItem value="Bangalore Central">Bangalore Central</SelectItem>
                          <SelectItem value="Chennai North">Chennai North</SelectItem>
                          <SelectItem value="Chennai South">Chennai South</SelectItem>
                          <SelectItem value="Chennai Central">Chennai Central</SelectItem>
                          <SelectItem value="Coimbatore">Coimbatore</SelectItem>
                          <SelectItem value="Madurai">Madurai</SelectItem>
                          <SelectItem value="Salem">Salem</SelectItem>
                          <SelectItem value="Tiruchirapalli">Tiruchirapalli</SelectItem>
                          <SelectItem value="Tirunelveli">Tirunelveli</SelectItem>
                          <SelectItem value="Vellore">Vellore</SelectItem>
                          <SelectItem value="Erode">Erode</SelectItem>
                          <SelectItem value="Tiruppur">Tiruppur</SelectItem>
                          <SelectItem value="Dindigul">Dindigul</SelectItem>
                          <SelectItem value="Thanjavur">Thanjavur</SelectItem>
                          <SelectItem value="Cuddalore">Cuddalore</SelectItem>
                          <SelectItem value="Nagapattinam">Nagapattinam</SelectItem>
                          <SelectItem value="Mayiladuthurai">Mayiladuthurai</SelectItem>
                          <SelectItem value="Ariyalur">Ariyalur</SelectItem>
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

            {/* Photo Capture */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200 flex items-center">
                <Camera className="w-5 h-5 mr-2 text-blue-600" />
                Live Photo Capture
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Capture Method
                  </label>
                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant={photoMethod === "camera" ? "default" : "outline"}
                      onClick={() => setPhotoMethod("camera")}
                      className="flex-1"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Live Camera
                    </Button>
                    <Button
                      type="button"
                      variant={photoMethod === "upload" ? "default" : "outline"}
                      onClick={() => setPhotoMethod("upload")}
                      className="flex-1"
                    >
                      Upload File
                    </Button>
                  </div>
                </div>

                <div>
                  {photoMethod === "camera" ? (
                    <div>
                      {!capturedPhoto ? (
                        <Button
                          type="button"
                          onClick={() => setShowCamera(true)}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Start Camera Capture
                        </Button>
                      ) : (
                        <div className="space-y-3">
                          <div className="relative">
                            <img
                              src={capturedPhoto}
                              alt="Captured"
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setCapturedPhoto(null);
                              setShowCamera(true);
                            }}
                            className="w-full"
                          >
                            Retake Photo
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <FileUpload
                      onFileSelect={setPhotoFile}
                      accept="image/*"
                      maxSize={2 * 1024 * 1024}
                    />
                  )}
                </div>
              </div>

              {showCamera && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
                  <CameraCapture
                    title="Capture Citizen Photo"
                    onCapture={handleCameraCapture}
                    onCancel={() => setShowCamera(false)}
                    className="max-w-2xl w-full"
                  />
                </div>
              )}
            </div>

            {/* Biometric Information */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200 flex items-center">
                <Fingerprint className="w-5 h-5 mr-2 text-blue-600" />
                Biometric Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-2 border-gray-200">
                  <CardContent className="p-6 text-center">
                    <Fingerprint className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h4 className="font-medium text-gray-900 mb-2">Fingerprint Capture</h4>
                    <p className="text-sm text-gray-600 mb-4">Touch-based fingerprint scanner</p>
                    
                    {!fingerprintData ? (
                      <Button 
                        type="button" 
                        onClick={() => setShowFingerprintScanner(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Fingerprint className="w-4 h-4 mr-2" />
                        Capture Fingerprint
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-20 h-20 mx-auto bg-blue-100 rounded-lg flex items-center justify-center">
                          <Fingerprint className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="text-sm text-green-600 font-medium">Fingerprint Captured</p>
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => {
                            setFingerprintData(null);
                            setShowFingerprintScanner(true);
                          }}
                          className="w-full"
                        >
                          Recapture
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-gray-200">
                  <CardContent className="p-6 text-center">
                    <Eye className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h4 className="font-medium text-gray-900 mb-2">Facial Recognition Data</h4>
                    <p className="text-sm text-gray-600 mb-4">Automatically captured with photo</p>
                    
                    {(capturedPhoto || photoFile) ? (
                      <div className="space-y-3">
                        <div className="w-20 h-20 mx-auto bg-green-100 rounded-lg flex items-center justify-center">
                          <Eye className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="text-sm text-green-600 font-medium">Facial Data Extracted</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-20 h-20 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                          <Eye className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">Capture photo first</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {showFingerprintScanner && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
                  <Card className="max-w-md w-full">
                    <CardHeader>
                      <CardTitle className="text-center">Fingerprint Scanner</CardTitle>
                      <p className="text-center text-gray-600">Place your thumb on the scanner</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="text-center">
                        <div className="w-32 h-32 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4 relative overflow-hidden">
                          <Fingerprint className="w-16 h-16 text-blue-600" />
                          {scanningProgress > 0 && (
                            <div 
                              className="absolute bottom-0 left-0 right-0 bg-blue-600 transition-all duration-300"
                              style={{ height: `${scanningProgress}%` }}
                            />
                          )}
                        </div>
                        
                        {scanningProgress === 0 && (
                          <p className="text-gray-600">Ready to scan</p>
                        )}
                        {scanningProgress > 0 && scanningProgress < 100 && (
                          <p className="text-blue-600">Scanning... {scanningProgress}%</p>
                        )}
                        {scanningProgress === 100 && (
                          <p className="text-green-600">Scan complete!</p>
                        )}
                      </div>

                      <div className="flex space-x-3">
                        {scanningProgress === 0 && (
                          <Button 
                            onClick={startFingerprintScan}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            Start Scan
                          </Button>
                        )}
                        {scanningProgress === 100 && (
                          <Button 
                            onClick={() => {
                              setFingerprintData(`fp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
                              setShowFingerprintScanner(false);
                              setScanningProgress(0);
                            }}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            Confirm
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setShowFingerprintScanner(false);
                            setScanningProgress(0);
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
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
