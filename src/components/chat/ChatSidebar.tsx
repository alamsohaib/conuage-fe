
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/services/api";
import { Chat } from "@/lib/types";
import { MessageCircle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";

const ChatSidebar = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user, profile, logout, userRole } = useAuth();

  const isManagerOrAdmin = userRole === 'manager' || userRole === 'org_admin';

  const fetchChats = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

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

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-sidebar-foreground">Chats</h2>
          </div>
          <SidebarTrigger className="lg:hidden" />
        </div>
        <Button 
          onClick={handleNewChat} 
          className="w-full flex items-center" 
          variant="outline"
        >
          <Plus size={16} className="mr-2" />
          New Chat
        </Button>
      </SidebarHeader>
      
      <SidebarContent className="p-0">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2">Previous Chats</SidebarGroupLabel>
          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No chats yet. Start by creating a new chat.
            </div>
          ) : (
            <SidebarMenu>
              {chats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton
                    isActive={chatId === chat.id}
                    asChild
                    className="group"
                  >
                    <div
                      onClick={() => navigate(`/chat/${chat.id}`)}
                      className="cursor-pointer w-full text-left"
                    >
                      <MessageCircle size={16} className="shrink-0" />
                      <span className="truncate">{chat.name}</span>
                      <span className="text-xs ml-auto text-muted-foreground">
                        {formatDistanceToNow(new Date(chat.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </SidebarMenuButton>
                  <SidebarMenuAction
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    showOnHover
                  >
                    <Trash2 size={16} className="text-destructive" />
                  </SidebarMenuAction>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          )}
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t mt-auto">
        <div className="flex items-center space-x-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{profile?.first_name || user?.firstName || user?.email}</p>
            <p className="text-xs text-muted-foreground truncate">{profile?.email || user?.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default ChatSidebar;
