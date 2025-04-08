
import { Outlet, Link, useLocation, useParams, useNavigate } from "react-router-dom";
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
  Brain
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

const AppLayout = () => {
  const { userRole, logout } = useAuth();
  const location = useLocation();
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const isChatSection = location.pathname.startsWith('/chat');

  // Fetch user profile
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data, error } = await api.auth.getProfile();
      if (error) throw new Error(error.message);
      return data;
    }
  });

  // Fetch chats when in chat section
  useEffect(() => {
    if (isChatSection) {
      fetchChats();
    }
  }, [isChatSection]);

  const fetchChats = async () => {
    setIsLoadingChats(true);
    try {
      const { data, error } = await api.chat.getChats();
      if (data) {
        setChats(data.chats || []);
      } else if (error) {
        toast.error(error.message || "Failed to load chats");
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      toast.error("Failed to load chats");
    } finally {
      setIsLoadingChats(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const { data, error } = await api.chat.createChat({ name: "New Chat" });
      if (data) {
        toast.success("New chat created");
        setChats([data, ...chats]);
        navigate(`/chat/${data.id}`);
      } else if (error) {
        toast.error(error.message || "Failed to create chat");
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Failed to create chat");
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
        toast.error(error.message || "Failed to delete chat");
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat");
    }
  };

  // Create navigation items based on user role
  const navItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      roles: ['end_user', 'manager', 'org_admin'],
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

  // Filter items based on user role
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(userRole || 'end_user')
  );

  return (
    <SidebarProvider defaultOpen={true} defaultPinned={true}>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar>
          <SidebarHeader className="flex items-center justify-between p-4">
            <div className="flex flex-1 items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-md flex items-center justify-center shadow-sm logo-shimmer">
                  <Brain className="w-5 h-5 text-primary-foreground" />
                </div>
                <h1 className="text-lg font-bold">conuage</h1>
              </div>
              <SidebarTrigger className="lg:hidden" />
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname.startsWith(item.url)}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            {/* Chat list section - only shown when in chat section */}
            {isChatSection && (
              <SidebarGroup>
                <SidebarGroupLabel className="flex justify-between items-center">
                  <span>Previous Chats</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleNewChat}
                    className="h-5 w-5"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </SidebarGroupLabel>

                {isLoadingChats ? (
                  <div className="flex justify-center p-2">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : chats.length === 0 ? (
                  <div className="p-2 text-center text-xs text-muted-foreground">
                    No chats yet
                  </div>
                ) : (
                  <SidebarMenu>
                    {chats.map((chat) => (
                      <SidebarMenuItem key={chat.id}>
                        <SidebarMenuButton
                          isActive={chatId === chat.id}
                          asChild
                          className="group text-xs"
                        >
                          <div
                            onClick={() => navigate(`/chat/${chat.id}`)}
                            className="cursor-pointer w-full text-left"
                          >
                            <MessageSquare size={16} className="shrink-0" />
                            <span className="truncate">{chat.name}</span>
                            <span className="text-[10px] ml-auto text-muted-foreground">
                              {formatDistanceToNow(new Date(chat.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </SidebarMenuButton>
                        <SidebarMenuAction
                          onClick={(e) => handleDeleteChat(chat.id, e)}
                          showOnHover
                        >
                          <Trash2 size={14} className="text-destructive" />
                        </SidebarMenuAction>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                )}
              </SidebarGroup>
            )}
          </SidebarContent>
          
          <SidebarFooter>
            <SidebarSeparator />
            
            {isProfileLoading ? (
              <div className="p-4 flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
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
                    className="w-full p-3 h-auto flex justify-start items-center gap-3 rounded-none hover:bg-accent"
                  >
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={profile?.profile_photo_url} />
                      <AvatarFallback>
                        {profile?.first_name?.charAt(0) || ''}
                        {profile?.last_name?.charAt(0) || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-left overflow-hidden">
                      <span className="font-medium text-sm truncate w-full">
                        {profile?.first_name} {profile?.last_name}
                      </span>
                      <span className="text-xs text-muted-foreground truncate w-full">
                        {profile?.email}
                      </span>
                    </div>
                    {isUserMenuOpen ? (
                      <ChevronLeft className="h-4 w-4 ml-auto" />
                    ) : (
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-3 py-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start gap-2"
                      asChild
                    >
                      <Link to="/profile">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                      onClick={logout}
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1 relative">
          {/* Theme toggle in top right corner */}
          <div className="absolute top-4 right-4 z-50">
            <ThemeToggle />
          </div>
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
