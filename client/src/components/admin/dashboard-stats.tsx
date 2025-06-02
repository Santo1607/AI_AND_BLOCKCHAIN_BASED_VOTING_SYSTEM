import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Users, UserPlus, Search, Shield } from "lucide-react";

interface DashboardStats {
  totalCitizens: number;
  newRegistrations: number;
  verificationsToday: number;
  systemStatus: string;
}

export function DashboardStats() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="card-shadow">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Citizens",
      value: stats?.totalCitizens || 0,
      icon: Users,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      title: "New Registrations",
      value: stats?.newRegistrations || 0,
      icon: UserPlus,
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      title: "Verifications Today",
      value: stats?.verificationsToday || 0,
      icon: Search,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600"
    },
    {
      title: "System Status",
      value: stats?.systemStatus === "operational" ? "Operational" : "Offline",
      icon: Shield,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      isStatus: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.isStatus ? 'text-green-600' : 'text-gray-900'}`}>
                    {stat.isStatus ? stat.value : stat.value.toLocaleString()}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <IconComponent className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
