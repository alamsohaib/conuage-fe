
import { Outlet } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Building, Users, CreditCard, MapPin } from "lucide-react";

const OrganizationLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    const path = location.pathname.split("/").pop();
    if (path) {
      setActiveTab(path);
    }
  }, [location.pathname]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/organization/${value}`);
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-md">
            <Building className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground dark:text-white">
            Organization Management
          </h1>
        </div>
        <p className="text-muted-foreground mt-2 dark:text-white/80">
          Configure your organization settings, manage locations, and control user access
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full mb-8">
        <TabsList className="grid grid-cols-4 w-full p-1 bg-muted/50 border border-border/30 rounded-lg shadow-subtle">
          <TabsTrigger 
            value="details" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Building className="h-4 w-4" />
            <span>Organization Details</span>
          </TabsTrigger>
          <TabsTrigger 
            value="subscription" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <CreditCard className="h-4 w-4" />
            <span>Subscription</span>
          </TabsTrigger>
          <TabsTrigger 
            value="locations" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <MapPin className="h-4 w-4" />
            <span>Locations</span>
          </TabsTrigger>
          <TabsTrigger 
            value="users" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="bg-card border border-border/50 rounded-lg shadow-card p-6 transition-all animate-scale-in">
        <Outlet />
      </div>
    </div>
  );
};

export default OrganizationLayout;
