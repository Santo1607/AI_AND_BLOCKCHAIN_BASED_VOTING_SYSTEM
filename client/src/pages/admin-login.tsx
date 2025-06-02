import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { loginSchema, type LoginData } from "@shared/schema";
import { Shield, User, Lock, AlertCircle, ArrowLeft } from "lucide-react";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "admin123",
      password: "admin@123"
    }
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/admin/login", data);
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Login Successful",
          description: `Welcome back, ${result.admin.name}!`,
        });
        setLocation("/admin/dashboard");
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: "Login Failed", 
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Aadhar Management System</h1>
                <p className="text-sm text-gray-500">Government of India</p>
              </div>
            </div>
            <Button 
              variant="outline"
              onClick={() => setLocation("/public")}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Public Portal
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md w-full mt-16">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Admin Access</CardTitle>
            <p className="text-gray-600 mt-2">Secure login to Aadhar Management System</p>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-sm font-medium text-gray-700">
                        <User className="w-4 h-4 mr-2" />
                        User ID
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          placeholder="Enter your admin ID"
                          className="input-focus"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-sm font-medium text-gray-700">
                        <Lock className="w-4 h-4 mr-2" />
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          type="password"
                          placeholder="Enter your password"
                          className="input-focus"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>Loading...</>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Secure Login
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center text-sm text-gray-500 mb-4">
                <AlertCircle className="w-4 h-4 mr-2" />
                Demo credentials provided above
              </div>
              <Button 
                variant="outline"
                className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                onClick={() => setLocation("/public")}
              >
                Access Public Verification Portal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
