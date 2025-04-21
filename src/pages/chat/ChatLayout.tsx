
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Welcome from "./Welcome";

const ChatLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redirect to welcome page if on /chat route
  useEffect(() => {
    if (location.pathname === "/chat") {
      navigate("/chat/welcome", { replace: true });
    }
  }, [location.pathname, navigate]);

  // Show Welcome component for the welcome route directly in the layout
  if (location.pathname === "/chat/welcome") {
    return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
        <Welcome />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
      <Outlet />
    </div>
  );
};

export default ChatLayout;
