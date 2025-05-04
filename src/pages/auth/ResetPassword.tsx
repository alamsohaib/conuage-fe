
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState<string | null>(null);
  
  useEffect(() => {
    // Get email from URL or sessionStorage
    const emailParam = searchParams.get("email");
    const storedEmail = sessionStorage.getItem("reset_password_email");
    
    const retrievedEmail = emailParam || storedEmail;
    
    // Store email in sessionStorage to persist through page reloads
    if (retrievedEmail) {
      sessionStorage.setItem("reset_password_email", retrievedEmail);
      setEmail(retrievedEmail);
    }
  }, [searchParams]);
  
  const subtitle = email 
    ? `Create a new password for your account` 
    : "Create a new password for your account";

  return (
    <AuthLayout
      title="Reset your password"
      subtitle={subtitle}
    >
      <ResetPasswordForm email={email} />
    </AuthLayout>
  );
};

export default ResetPassword;
