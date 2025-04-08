
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui-custom/Button";
import Input from "@/components/ui-custom/Input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const verifyEmailSchema = z.object({
  code: z.string().min(6, "Verification code must be at least 6 characters"),
});

type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;

const VerifyEmailForm = () => {
  const { verifyEmail, regenerateVerificationCode } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

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
    if (!email) return;
    
    setIsSubmitting(true);
    try {
      const success = await verifyEmail(email, data.code);
      if (success) {
        navigate("/auth/login");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;
    
    setIsResending(true);
    try {
      await regenerateVerificationCode(email);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="p-3 bg-secondary/50 rounded-lg text-sm text-center mb-2">
        We sent a verification code to <span className="font-medium">{email}</span>
      </div>
      
      <Input
        label="Verification Code"
        {...register("code")}
        error={errors.code?.message}
        placeholder="Enter the 6-digit code"
      />
      
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
