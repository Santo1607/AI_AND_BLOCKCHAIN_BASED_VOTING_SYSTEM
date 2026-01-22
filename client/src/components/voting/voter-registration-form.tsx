import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { voterRegistrationSchema, type VoterRegistrationData, Citizen, VoterRegistration } from "@shared/schema";
import { UserCheck, IdCard, Calendar, ArrowLeft, CheckCircle, Download, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { VoterAcknowledgementTemplate } from "./voter-acknowledgement-template";
import { getStates, INDIAN_LOCATIONS } from "@/lib/locations";

interface VoterRegistrationFormProps {
  onBack: () => void;
}

interface RegistrationResult {
  citizen: Citizen;
  registration: VoterRegistration;
}

export function VoterRegistrationForm({ onBack }: VoterRegistrationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<RegistrationResult | null>(null);
  const templateRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const form = useForm<VoterRegistrationData>({
    resolver: zodResolver(voterRegistrationSchema),
    defaultValues: {
      aadharNumber: "",
      dateOfBirth: "",
      state: "",
      constituency: ""
    }
  });

  const formatAadharNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 4) return numbers;
    if (numbers.length <= 8) return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
    return `${numbers.slice(0, 4)}-${numbers.slice(4, 8)}-${numbers.slice(8, 12)}`;
  };

  const onSubmit = async (data: VoterRegistrationData) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/voter/register", data);
      const result = await response.json();

      if (result.success) {
        setRegistrationResult({
          citizen: result.citizen,
          registration: result.registration
        });
        toast({
          title: "Registration Successful",
          description: "You are now registered to vote in elections.",
        });
        form.reset();
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Registration failed. Please verify your Aadhar details.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadAcknowledgement = async () => {
    if (!templateRef.current || !registrationResult) return;

    setIsDownloading(true);
    try {
      const element = templateRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 794,
        windowHeight: 1123,
        width: 794,
        height: 1123,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Voter_Acknowledgement_${registrationResult.citizen.aadharNumber}.pdf`);

      toast({
        title: "Success",
        description: "Acknowledgement form downloaded successfully.",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Download Failed",
        description: "Could not generate the acknowledgement PDF.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (registrationResult) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Voter Registration</h1>
                  <p className="text-sm text-gray-500">Digital Voting Portal</p>
                </div>
              </div>
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Portal
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card className="shadow-xl border-0 overflow-hidden">
            <div className="bg-green-600 h-2 w-full" />
            <CardHeader className="text-center pb-8 pt-10">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900">Registration Successful!</CardTitle>
              <p className="text-gray-600 mt-4">
                Thank you for registering, <strong>{registrationResult.citizen.name}</strong>.
                Your Aadhar Number is now your unique Voter ID.
              </p>
            </CardHeader>

            <CardContent className="px-10 pb-12">
              <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-8 text-center">
                <h3 className="text-sm uppercase tracking-widest font-bold text-green-800 mb-2">Registered Aadhar ID</h3>
                <p className="text-4xl font-mono font-black text-green-600 tracking-tighter">
                  {registrationResult.citizen.aadharNumber}
                </p>
                <div className="mt-4 pt-4 border-t border-green-200 text-sm text-green-700 font-medium">
                  Assigned Constituency: <span className="text-green-900 font-bold">{registrationResult.citizen.constituency}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-sm font-medium">Aadhar Verified</span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-sm font-medium">Biometrics Matched</span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-sm font-medium">Address Validated</span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-sm font-medium">Electoral Active</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  className="flex-1 h-14 bg-green-600 hover:bg-green-700 text-lg shadow-lg hover:shadow-green-200 transition-all font-bold"
                  onClick={downloadAcknowledgement}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Download Official Acknowledgement
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="h-14 px-8 text-gray-600 hover:bg-gray-50 font-semibold"
                  onClick={() => window.location.href = '/voting'}
                >
                  Go to Voting Portal
                </Button>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-gray-500 mt-8 text-sm italic">
            This acknowledgement serves as your official permission to vote until your physical Voter card is delivered.
          </p>
        </div>

        {/* Hidden Template for PDF Capture */}
        <div className="absolute opacity-0 pointer-events-none" style={{ left: '-9999px', top: '0' }}>
          <div ref={templateRef} style={{ width: '794px', height: '1123px' }}>
            <VoterAcknowledgementTemplate data={registrationResult} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Voter Registration</h1>
                <p className="text-sm text-gray-500">Digital Voting Portal</p>
              </div>
            </div>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Portal
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Register as a Voter</h2>
          <p className="text-lg text-gray-600">
            Use your Aadhar details to register for voting in elections. This is a one-time process.
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-900 text-center">
              Aadhar Verification Required
            </CardTitle>
            <p className="text-center text-gray-600 mt-2">
              We'll verify your identity using the Aadhar management system
            </p>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="aadharNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-medium text-gray-900 flex items-center">
                        <IdCard className="w-5 h-5 mr-2 text-green-600" />
                        Aadhar Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="XXXX-XXXX-XXXX"
                          className="text-lg px-6 py-4 input-focus"
                          onChange={(e) => {
                            const formatted = formatAadharNumber(e.target.value);
                            field.onChange(formatted);
                          }}
                          maxLength={14}
                        />
                      </FormControl>
                      <p className="text-sm text-gray-500">
                        Enter your 12-digit Aadhar number
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-medium text-gray-900 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-green-600" />
                        Date of Birth
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          className="text-lg px-6 py-4 input-focus"
                          max={new Date().toISOString().split('T')[0]}
                          min="1900-01-01"
                        />
                      </FormControl>
                      <p className="text-sm text-gray-500">
                        Must match your Aadhar registration
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />



                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <UserCheck className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">Verification Process</h4>
                      <p className="text-sm text-blue-800">
                        Your details will be verified against the Aadhar database. Only verified citizens
                        can register to vote. This ensures election integrity and prevents fraud.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full py-4 px-6 text-lg font-semibold bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Verifying & Registering...
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-5 h-5 mr-2" />
                      Register to Vote
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}