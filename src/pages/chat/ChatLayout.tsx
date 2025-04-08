
import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ChatLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redirect to welcome page if on /chat route
  useEffect(() => {
    if (location.pathname === "/chat") {
      navigate("/chat/welcome", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
      <Outlet />
    </div>
  );
};

export default ChatLayout;
