
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui-custom/Button";
import Input from "@/components/ui-custom/Input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { api } from "@/services/api";

const verifyEmailSchema = z.object({
  code: z.string().min(6, "Verification code must be at least 6 characters"),
});

type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;

const VerifyEmailForm = () => {
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get email from URL parameters and store it in state
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
      console.log("Email from URL parameter:", emailParam);
    } else {
      console.log("No email in URL parameters, checking sessionStorage");
    }
    
    // Store email in sessionStorage as a backup
    if (emailParam) {
      sessionStorage.setItem("verification_email", emailParam);
    } else {
      // Try to restore from sessionStorage if not in URL
      const storedEmail = sessionStorage.getItem("verification_email");
      if (storedEmail) {
        console.log("Email restored from sessionStorage:", storedEmail);
        setEmail(storedEmail);
      } else {
        console.log("No email found in sessionStorage");
      }
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (data: VerifyEmailFormValues) => {
    if (!email) {
      setError("Email address is missing. Please try to sign up again.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log("Submitting verification with email:", email, "code:", data.code);
      
      // Make a direct fetch call to bypass any potential API wrapper issues
      const response = await fetch(`https://conuage-be-187523307981.us-central1.run.app/api/v1/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          code: data.code
        }),
      });
      
      const responseData = await response.json().catch(() => ({}));
      
      if (response.ok) {
        // Clear stored email on successful verification
        sessionStorage.removeItem("verification_email");
        navigate("/auth/login");
        toast.success("Email verified successfully! You can now log in.");
      } else {
        console.error("Verification API error response:", responseData);
        // Improve error handling to display more specific error messages
        if (responseData.detail && 
            (responseData.detail.includes('PGRST100') || 
             responseData.detail.includes('parse order'))) {
          setError("Server error occurred. Please try again later or contact support.");
        } else {
          setError(`Verification failed: ${responseData.detail || response.statusText}`);
        }
      }
    } catch (err) {
      // Handle unexpected errors
      console.error("Verification error:", err);
      if (err instanceof Error) {
        setError(`Verification failed: ${err.message}`);
      } else {
        setError("An unexpected error occurred during verification. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError("Email address is missing. Please try to sign up again.");
      return;
    }
    
    setIsResending(true);
    setError(null);
    
    try {
      console.log("Resending verification code to:", email);
      const response = await api.auth.regenerateVerificationCode(email);
      
      if (response.error) {
        setError(`Failed to resend verification code: ${response.error.message}`);
      } else {
        toast.success("Verification code has been sent to your email");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to resend verification code: ${errorMessage}`);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="p-4 bg-muted/50 rounded-lg text-sm text-center mb-2">
        We sent a verification code to <span className="font-medium">{email || "your email"}</span>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="code" className="text-sm font-medium">
          Verification Code
        </label>
        <Input
          id="code"
          {...register("code")}
          error={errors.code?.message}
          placeholder="Enter the 6-digit code"
          className="h-12"
        />
      </div>
      
      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <Button
        type="submit"
        className="w-full"
        size="lg"
        loading={isSubmitting}
      >
        Verify Email
      </Button>
      
      <div className="text-center mt-4">
        <button
          type="button"
          onClick={handleResendCode}
          className="text-sm text-primary hover:underline focus-ring rounded px-2 py-1"
          disabled={isResending}
        >
          {isResending ? "Sending..." : "Didn't receive the code? Resend"}
        </button>
      </div>
    </form>
  );
};

export default VerifyEmailForm;
