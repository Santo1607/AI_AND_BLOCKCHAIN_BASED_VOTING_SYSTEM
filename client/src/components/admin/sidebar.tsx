import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, UserPlus, FileText, Vote, Clock } from "lucide-react";

type AdminSection = "overview" | "citizens" | "add-citizen" | "candidates" | "elections" | "reports";

interface SidebarProps {
  currentSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}

export function Sidebar({ currentSection, onSectionChange }: SidebarProps) {
  const navigationItems = [
    {
      id: "overview" as AdminSection,
      label: "Overview",
      icon: BarChart3,
      description: "Dashboard overview"
    },
    {
      id: "citizens" as AdminSection,
      label: "Citizen Records",
      icon: Users,
      description: "View all citizens"
    },
    {
      id: "add-citizen" as AdminSection,
      label: "Add New Citizen",
      icon: UserPlus,
      description: "Register new citizen"
    },
    {
      id: "candidates" as AdminSection,
      label: "Candidates",
      icon: Vote,
      description: "Manage candidates"
    },
    {
      id: "elections" as AdminSection,
      label: "Election Control",
      icon: Clock,
      description: "Manage election timings & results"
    },
    {
      id: "reports" as AdminSection,
      label: "Reports",
      icon: FileText,
      description: "Generate reports"
    }
  ];

  return (
    <nav className="w-64 bg-white shadow-lg min-h-screen border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Admin Dashboard</h3>
        <p className="text-sm text-gray-500">Manage citizen records</p>
      </div>
      
      <div className="p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentSection === item.id;
            
            return (
              <li key={item.id}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-auto p-4 text-left font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  onClick={() => onSectionChange(item.id)}
                >
                  <IconComponent 
                    className={cn(
                      "w-5 h-5 mr-3",
                      isActive ? "text-blue-600" : "text-gray-500"
                    )} 
                  />
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500 font-normal">
                      {item.description}
                    </div>
                  </div>
                </Button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
