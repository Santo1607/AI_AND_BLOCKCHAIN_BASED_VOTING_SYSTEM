import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { verificationSchema, type VerificationData, type Citizen } from "@shared/schema";
import { IdCard, Calendar, Shield } from "lucide-react";

interface VerificationFormProps {
  onSuccess: (citizen: Citizen) => void;
}

export function VerificationForm({ onSuccess }: VerificationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<VerificationData>({
    resolver: zodResolver(verificationSchema),
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

  const onSubmit = async (data: VerificationData) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/verify", data);
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Verification Successful",
          description: "Your details have been found in our records.",
        });
        onSuccess(result.citizen);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "No matching record found. Please check your details.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="aadharNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-medium text-gray-900 flex items-center">
                <IdCard className="w-5 h-5 mr-2 text-blue-600" />
                Enter Your Aadhar Number
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
              <p className="text-sm text-gray-500 flex items-center mt-2">
                <Shield className="w-4 h-4 mr-1" />
                Your information is secure and encrypted
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
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Date of Birth
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="date"
                  className="text-lg px-6 py-4 input-focus"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full py-4 px-6 text-lg font-semibold btn-primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <>Verifying...</>
          ) : (
            <>
              <Shield className="w-5 h-5 mr-2" />
              Verify Details
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
