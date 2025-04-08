
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui-custom/Button";
import Input from "@/components/ui-custom/Input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const resetPasswordSchema = z.object({
  code: z.string().min(6, "Verification code must be at least 6 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPasswordForm = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      code: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!email) return;
    
    setIsSubmitting(true);
    try {
      const success = await resetPassword(email, data.code, data.password);
      if (success) {
        navigate("/auth/login");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="p-3 bg-secondary/50 rounded-lg text-sm text-center mb-2">
        Resetting password for <span className="font-medium">{email}</span>
      </div>
      
      <Input
        label="Verification Code"
        {...register("code")}
        error={errors.code?.message}
        placeholder="Enter the code from your email"
      />
      
      <Input
        label="New Password"
        type="password"
        {...register("password")}
        error={errors.password?.message}
        placeholder="••••••••"
        autoComplete="new-password"
      />
      
      <Input
        label="Confirm New Password"
        type="password"
        {...register("confirmPassword")}
        error={errors.confirmPassword?.message}
        placeholder="••••••••"
        autoComplete="new-password"
      />
      
      <Button
        type="submit"
        className="w-full mt-6"
        size="lg"
        loading={isSubmitting}
      >
        Reset Password
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
