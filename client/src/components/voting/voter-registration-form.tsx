import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { voterRegistrationSchema, type VoterRegistrationData } from "@shared/schema";
import { UserCheck, IdCard, Calendar, ArrowLeft, CheckCircle } from "lucide-react";

interface VoterRegistrationFormProps {
  onBack: () => void;
}

export function VoterRegistrationForm({ onBack }: VoterRegistrationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<VoterRegistrationData>({
    resolver: zodResolver(voterRegistrationSchema),
    defaultValues: {
      aadharNumber: "",
      dateOfBirth: ""
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
        setRegistrationSuccess(result.voterIdNumber);
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

  if (registrationSuccess) {
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
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900">Registration Successful!</CardTitle>
              <p className="text-gray-600 mt-4">You are now registered to vote in all future elections</p>
            </CardHeader>

            <CardContent className="text-center">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Your Voter ID Number</h3>
                <p className="text-2xl font-mono font-bold text-green-600">{registrationSuccess}</p>
                <p className="text-sm text-green-700 mt-2">Please save this number for future reference</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span>Aadhar verification completed</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span>Voter registration activated</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span>Eligible for all future elections</span>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={onBack}
                >
                  Continue to Voting
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={onBack}
                >
                  Back to Portal
                </Button>
              </div>
            </CardContent>
          </Card>
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
                    <>Verifying & Registering...</>
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