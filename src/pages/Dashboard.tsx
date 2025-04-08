
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui-custom/Button";
import { useNavigate } from "react-router-dom";
import { FileText, MessageSquare, Building, User, LogOut, LayoutDashboard } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const Dashboard = () => {
  const { user, profile, logout, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect end_users to the chat interface
    if (userRole === 'end_user') {
      navigate('/chat');
    }
  }, [userRole, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="font-medium text-lg">SecureAuth Dashboard</div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              onClick={logout}
              className="flex items-center gap-2 text-sm"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-10">
        <div className="animate-fade-in max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight animate-slide-down">
              Welcome, {profile?.first_name || user?.firstName || "User"}
            </h1>
            <p className="text-muted-foreground animate-slide-down animation-delay-100">
              You're signed in as <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">{userRole || 'user'}</span>
            </p>
          </div>

          {/* Feature Cards for Managers */}
          {(userRole === 'manager' || userRole === 'org_admin') && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8 animate-slide-up animation-delay-200">
              <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 border-border/50">
                <div className="h-1.5 w-full bg-primary/80" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Document Management
                  </CardTitle>
                  <CardDescription>
                    Create, organize, and process documents in folders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Upload, categorize, and process documents efficiently. Create folder structures to keep everything organized.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => navigate('/documents')} 
                    className="w-full shadow-button hover:scale-[1.02] transition-all"
                  >
                    Manage Documents
                  </Button>
                </CardFooter>
              </Card>

              <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 border-border/50">
                <div className="h-1.5 w-full bg-primary/80" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Chat Interface
                  </CardTitle>
                  <CardDescription>
                    Access the AI chat interface
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Interact with our AI assistant to answer questions, get insights from your documents, and more.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => navigate('/chat')} 
                    className="w-full shadow-button hover:scale-[1.02] transition-all"
                  >
                    Open Chat
                  </Button>
                </CardFooter>
              </Card>

              {/* Organization Management Card - Only for org_admin */}
              {userRole === 'org_admin' && (
                <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 border-border/50">
                  <div className="h-1.5 w-full bg-primary/80" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-primary" />
                      Organization Management
                    </CardTitle>
                    <CardDescription>
                      Manage organization settings and users
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Configure organization details, subscription plans, locations, and manage user access and permissions.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={() => navigate('/organization')} 
                      className="w-full shadow-button hover:scale-[1.02] transition-all"
                    >
                      Manage Organization
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          )}

          <div className="glass rounded-xl p-6 animate-slide-up animation-delay-200 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-4">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Account Information</h2>
            </div>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5 p-3 rounded-lg bg-card/50 border border-border/30">
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="font-medium">{profile?.email || user?.email}</div>
                </div>
                <div className="space-y-1.5 p-3 rounded-lg bg-card/50 border border-border/30">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="font-medium">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      {profile?.status || user?.status || "Active"}
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5 p-3 rounded-lg bg-card/50 border border-border/30">
                  <div className="text-sm text-muted-foreground">First Name</div>
                  <div className="font-medium">{profile?.first_name || user?.firstName || "-"}</div>
                </div>
                <div className="space-y-1.5 p-3 rounded-lg bg-card/50 border border-border/30">
                  <div className="text-sm text-muted-foreground">Last Name</div>
                  <div className="font-medium">{profile?.last_name || user?.lastName || "-"}</div>
                </div>
                <div className="space-y-1.5 p-3 rounded-lg bg-card/50 border border-border/30">
                  <div className="text-sm text-muted-foreground">Role</div>
                  <div className="font-medium">{userRole || "-"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
