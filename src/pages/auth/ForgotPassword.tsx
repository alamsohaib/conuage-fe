
import { useEffect } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

const ForgotPassword = () => {
  useEffect(() => {
    // Clear any previous reset password email when landing on forgot password page
    sessionStorage.removeItem("reset_password_email");
  }, []);
  
  return (
    <AuthLayout
      title="Forgot password"
      subtitle="Enter your email and we'll send you instructions to reset your password"
      footerLink={{
        text: "Back to login",
        to: "/auth/login"
      }}
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
};

export default ForgotPassword;
