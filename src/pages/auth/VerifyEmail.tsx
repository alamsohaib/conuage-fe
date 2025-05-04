
import { useSearchParams } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout";
import VerifyEmailForm from "@/components/auth/VerifyEmailForm";
import { useEffect, useState } from "react";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState<string | null>(null);
  
  useEffect(() => {
    // Get email from URL or sessionStorage
    const emailParam = searchParams.get("email");
    const storedEmail = sessionStorage.getItem("verification_email");
    
    setEmail(emailParam || storedEmail);
  }, [searchParams]);
  
  const subtitle = email 
    ? `Enter the verification code we sent to ${email}` 
    : "Please check your email for the verification code";

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={subtitle}
    >
      <VerifyEmailForm />
    </AuthLayout>
  );
};

export default VerifyEmail;
