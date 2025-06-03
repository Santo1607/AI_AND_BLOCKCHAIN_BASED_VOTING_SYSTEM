import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/admin/sidebar";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { CitizensTable } from "@/components/admin/citizens-table";
import { CitizenForm } from "@/components/admin/citizen-form";
import { CandidateManagement } from "@/components/admin/candidate-management";
import { ElectionManagement } from "@/components/admin/election-management";
import { LanguageSelectorButton } from "@/components/language-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useLanguage } from "@/hooks/use-language";
import { apiRequest } from "@/lib/queryClient";
import { Shield, LogOut, FileBarChart, Download, Calendar } from "lucide-react";

type AdminSection = "overview" | "citizens" | "add-citizen" | "candidates" | "elections" | "reports";

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [currentSection, setCurrentSection] = useState<AdminSection>("overview");
  const { toast } = useToast();
  const { admin, isLoading: authLoading } = useAdminAuth();

  useEffect(() => {
    if (!authLoading && !admin) {
      setLocation("/admin");
    }
  }, [admin, authLoading, setLocation]);

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/admin/logout");
      toast({
        title: "Logged out successfully",
        description: "You have been securely logged out.",
      });
      setLocation("/admin");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  const renderContent = () => {
    switch (currentSection) {
      case "overview":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
              <p className="text-gray-600">Monitor and manage citizen registration data</p>
            </div>
            <DashboardStats />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-blue-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start btn-primary"
                    onClick={() => setCurrentSection("add-citizen")}
                  >
                    Add New Citizen
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setCurrentSection("citizens")}
                  >
                    Search Records
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setCurrentSection("reports")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Database</span>
                      <span className="text-sm font-medium text-green-600 flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Online
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Security</span>
                      <span className="text-sm font-medium text-green-600 flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Secure
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Backup</span>
                      <span className="text-sm font-medium text-green-600 flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Updated
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      
      case "citizens":
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Citizen Records</h2>
                <p className="text-gray-600">View and manage all registered citizens</p>
              </div>
              <Button 
                className="btn-primary"
                onClick={() => setCurrentSection("add-citizen")}
              >
                Add New Citizen
              </Button>
            </div>
            <CitizensTable />
          </div>
        );
      
      case "add-citizen":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Add New Citizen</h2>
              <p className="text-gray-600">Register a new citizen with complete details</p>
            </div>
            <CitizenForm onSuccess={() => setCurrentSection("citizens")} />
          </div>
        );
      
      case "candidates":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Candidate Management</h2>
              <p className="text-gray-600">Manage election candidates by constituency</p>
            </div>
            <CandidateManagement />
          </div>
        );
      
      case "elections":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Election Control</h2>
              <p className="text-gray-600">Manage election timings and view results</p>
            </div>
            <ElectionManagement />
          </div>
        );
      
      case "reports":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h2>
              <p className="text-gray-600">Generate comprehensive reports and view system analytics</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="card-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <FileBarChart className="w-6 h-6 text-blue-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Registration Report</h3>
                  </div>
                  <p className="text-gray-600 mb-4">Generate detailed registration statistics</p>
                  <Button className="w-full btn-primary">
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="card-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Download className="w-6 h-6 text-blue-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">District-wise Report</h3>
                  </div>
                  <p className="text-gray-600 mb-4">View registrations by district</p>
                  <Button className="w-full btn-primary">
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="card-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Calendar className="w-6 h-6 text-blue-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Monthly Report</h3>
                  </div>
                  <p className="text-gray-600 mb-4">Monthly registration trends</p>
                  <Button className="w-full btn-primary">
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
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
            
            <div className="flex items-center space-x-4">
              <LanguageSelectorButton />
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <span>{t('welcome')}, {admin.name}</span>
              </div>
              <Button 
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t('logout')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <Sidebar 
          currentSection={currentSection} 
          onSectionChange={setCurrentSection} 
        />
        
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
