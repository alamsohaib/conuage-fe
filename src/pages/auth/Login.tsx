
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const { isAuthenticated, userRole, isLoading } = useAuth();
  const navigate = useNavigate();
  const [redirected, setRedirected] = useState(false);

  // Only redirect if authenticated and not already redirected
  useEffect(() => {
    if (isAuthenticated && !isLoading && !redirected) {
      setRedirected(true);
      
      if (userRole === 'end_user') {
        navigate("/chat");
      } else if (userRole === 'org_admin' || userRole === 'manager') {
        navigate("/dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  }, [isAuthenticated, navigate, userRole, isLoading, redirected]);

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
      footerText="Don't have an account?"
      footerLink={{
        text: "Create one",
        to: "/auth/signup"
      }}
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
