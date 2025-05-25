
import { Outlet, Link, useLocation, useParams, useNavigate, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  Building2, 
  User, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Plus,
  Trash2,
  Brain,
  Loader
} from "lucide-react";
import { 
  Sidebar, 
  SidebarProvider, 
  SidebarContent, 
  SidebarFooter,
  SidebarHeader,
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarTrigger,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuAction
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Chat } from "@/lib/types";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays}d`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}M`;
};

export default function AppLayout() {
  const { userRole, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const isChatSection = location.pathname.startsWith('/chat');
  const isDashboardPage = location.pathname === '/dashboard';
  const [shouldRedirectToLogin, setShouldRedirectToLogin] = useState(false);

  const handleAuthError = () => {
    console.log("Authentication error detected in AppLayout");
    toast.error("Your session has expired. Please login again.");
    logout();
    setShouldRedirectToLogin(true);
  };

  const { data: profile, isLoading: isProfileLoading, error: profileError } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        const { data, error } = await api.auth.getProfile();
        if (error) {
          const isUnauthorized = error.code === '401' || error.message.includes('401') || error.message.toLowerCase().includes('unauthorized');
          
          if (isUnauthorized) {
            handleAuthError();
            return null;
          }
          throw new Error(error.message);
        }
        return data;
      } catch (err) {
        console.error("Error fetching profile:", err);
        
        if (err instanceof Error && 
           (err.message.includes('401') || 
            err.message.toLowerCase().includes('unauthorized'))) {
          handleAuthError();
          return null;
        }
        
        return null;
      }
    },
    enabled: isAuthenticated,
    retry: 1,
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    if (shouldRedirectToLogin) {
      navigate('/auth/login', { replace: true });
    }
  }, [shouldRedirectToLogin, navigate]);

  useEffect(() => {
    if (!isAuthenticated && !location.pathname.startsWith('/auth/')) {
      setShouldRedirectToLogin(true);
    }
  }, [isAuthenticated, location.pathname]);

  useEffect(() => {
    if (isChatSection && isAuthenticated) {
      fetchChats();
    }
  }, [isChatSection, isAuthenticated]);

  const fetchChats = async () => {
    setIsLoadingChats(true);
    try {
      const { data, error } = await api.chat.getChats();
      if (data) {
        setChats(data.chats || []);
      } else if (error) {
        const isUnauthorized = error.code === '401' || error.message.includes('401') || error.message.toLowerCase().includes('unauthorized');
        
        if (isUnauthorized) {
          console.log("Session expired or invalid when fetching chats.");
          handleAuthError();
        } else {
          toast.error("Failed to load chats. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      
      if (error instanceof Error && 
         (error.message.includes('401') || 
          error.message.toLowerCase().includes('unauthorized'))) {
        handleAuthError();
        return;
      }
      
      toast.error("Network error while loading chats.");
    } finally {
      setIsLoadingChats(false);
    }
  };

  const handleNewChat = async () => {
    if (isCreatingChat) return;
    
    setIsCreatingChat(true);
    try {
      const { data, error } = await api.chat.createChat({ name: "New Chat" });
      if (data) {
        toast.success("New chat created");
        await fetchChats(); // Refresh the chat list
        navigate(`/chat/${data.id}`);
      } else if (error) {
        const isUnauthorized = error.code === '401' || error.message.includes('401') || error.message.toLowerCase().includes('unauthorized');
        
        if (isUnauthorized) {
          handleAuthError();
        } else {
          toast.error(error.message || "Failed to create chat");
        }
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      
      if (error instanceof Error && 
         (error.message.includes('401') || 
          error.message.toLowerCase().includes('unauthorized'))) {
        handleAuthError();
        return;
      }
      
      toast.error("Failed to create chat");
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this chat?")) return;
    
    try {
      const { error } = await api.chat.deleteChat(id);
      if (!error) {
        toast.success("Chat deleted");
        setChats(chats.filter(chat => chat.id !== id));
        if (chatId === id) {
          navigate('/chat');
        }
      } else {
        const isUnauthorized = error.code === '401' || error.message.includes('401') || error.message.toLowerCase().includes('unauthorized');
        
        if (isUnauthorized) {
          handleAuthError();
        } else {
          toast.error(error.message || "Failed to delete chat");
        }
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      
      if (error instanceof Error && 
         (error.message.includes('401') || 
          error.message.toLowerCase().includes('unauthorized'))) {
        handleAuthError();
        return;
      }
      
      toast.error("Failed to delete chat");
    }
  };

  if (shouldRedirectToLogin) {
    return <Navigate to="/auth/login" replace />;
  }

  const navItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      roles: ['manager', 'org_admin'],  // Removed 'end_user' from here
    },
    {
      title: "Chat",
      url: "/chat",
      icon: MessageSquare,
      roles: ['end_user', 'manager', 'org_admin'],
    },
    {
      title: "Documents",
      url: "/documents",
      icon: FileText,
      roles: ['manager', 'org_admin'],
    },
    {
      title: "Organization",
      url: "/organization/details",
      icon: Building2,
      roles: ['org_admin'],
    }
  ];

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(userRole || 'end_user')
  );

  return (
    <SidebarProvider defaultOpen={true} defaultPinned={true}>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar>
          <SidebarHeader className="flex items-center p-4 border-b border-sidebar-border">
            <div className="flex flex-1 items-center justify-center group-data-[collapsible=icon]:justify-center">
              <div className="flex items-center space-x-3 group-data-[collapsible=icon]:space-x-0">
                <div className="w-10 h-10 bg-sidebar-primary rounded-md flex items-center justify-center shadow-sm logo-shimmer">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-sidebar-foreground group-data-[collapsible=icon]:hidden">conuage</h1>
              </div>
            </div>
            <SidebarTrigger className="lg:hidden" />
          </SidebarHeader>
          
          <SidebarContent className="flex flex-col h-full overflow-hidden">
            <div className="px-2">
              <SidebarMenu className="mt-2 px-2">
                {filteredNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location.pathname.startsWith(item.url)}
                      tooltip={item.title}
                      className="py-2.5 group font-medium"
                    >
                      <Link to={item.url} className="flex items-center group-data-[collapsible=icon]:justify-center">
                        <item.icon className="h-5 w-5 mr-3 group-data-[collapsible=icon]:mr-0" />
                        <span className="text-base group-data-[collapsible=icon]:hidden">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>

            {isChatSection && (
              <div className="flex-1 min-h-0 group-data-[collapsible=icon]:hidden">
                <SidebarSeparator className="my-3" />
                <div className="flex justify-between items-center text-sm font-semibold text-sidebar-foreground/70 px-5 mb-2">
                  <span>Previous Chats</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleNewChat}
                        disabled={isCreatingChat || isLoadingChats}
                        className="h-7 w-7 hover:bg-sidebar-accent"
                      >
                        {isCreatingChat ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>New Chat</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <ScrollArea className="h-[calc(100vh-20rem)] px-2">
                  {isLoadingChats ? (
                    <div className="space-y-2 px-2">
                      <div className="animate-pulse h-8 w-full bg-sidebar-accent/30 rounded mb-2"></div>
                      <div className="animate-pulse h-8 w-full bg-sidebar-accent/30 rounded mb-2"></div>
                    </div>
                  ) : chats.length === 0 ? (
                    <div className="p-3 text-center text-sm text-sidebar-foreground/60">
                      No chats yet
                    </div>
                  ) : (
                    <SidebarMenu className="px-2">
                      {chats.map((chat) => (
                        <SidebarMenuItem key={chat.id}>
                          <SidebarMenuButton
                            isActive={chatId === chat.id}
                            asChild
                            className="group text-sm py-2"
                            tooltip={chat.name}
                          >
                            <div
                              onClick={() => navigate(`/chat/${chat.id}`)}
                              className="cursor-pointer w-full text-left flex items-center group-data-[collapsible=icon]:justify-center"
                            >
                              <MessageSquare size={18} className="mr-3 shrink-0 group-data-[collapsible=icon]:mr-0" />
                              <span className="flex-1 truncate font-medium group-data-[collapsible=icon]:hidden">{chat.name}</span>
                              <span className="text-xs ml-2 text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden">
                                {formatTimeAgo(new Date(chat.created_at))}
                              </span>
                            </div>
                          </SidebarMenuButton>
                          <SidebarMenuAction
                            onClick={(e) => handleDeleteChat(chat.id, e)}
                            showOnHover
                            className="group-data-[collapsible=icon]:hidden"
                          >
                            <Trash2 size={16} className="text-destructive" />
                          </SidebarMenuAction>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  )}
                </ScrollArea>
              </div>
            )}
          </SidebarContent>
          
          <SidebarFooter>
            <SidebarSeparator className="mb-2" />
            
            {isProfileLoading ? (
              <div className="p-4 flex items-center justify-center group-data-[collapsible=icon]:justify-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 group-data-[collapsible=icon]:hidden">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ) : (
              <Collapsible
                open={isUserMenuOpen}
                onOpenChange={setIsUserMenuOpen}
                className="w-full"
              >
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className={cn(
                      "w-full px-4 py-3 h-auto flex justify-start items-center gap-4 rounded-none hover:bg-sidebar-accent",
                      "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                    )}
                  >
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={profile?.profile_photo_url} />
                      <AvatarFallback className="text-base bg-sidebar-primary/20 text-sidebar-primary">
                        {profile?.first_name?.charAt(0) || ''}
                        {profile?.last_name?.charAt(0) || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-left overflow-hidden group-data-[collapsible=icon]:hidden">
                      <span className="text-base font-medium truncate w-full">
                        {profile?.first_name} {profile?.last_name}
                      </span>
                      <span className="text-sm text-sidebar-foreground/70 truncate w-full">
                        {profile?.email}
                      </span>
                    </div>
                    <ChevronRight className="h-5 w-5 ml-auto group-data-[collapsible=icon]:hidden" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
                  <div className="px-4 py-2 space-y-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start gap-3 text-sm"
                      asChild
                    >
                      <Link to="/profile">
                        <User className="h-5 w-5" />
                        Profile
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start gap-3 text-sm text-destructive hover:text-destructive"
                      onClick={logout}
                    >
                      <LogOut className="h-5 w-5" />
                      Log out
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1 relative">
          {!isDashboardPage && (
            <div className="absolute top-4 right-4 z-[100]">
              <ThemeToggle />
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
