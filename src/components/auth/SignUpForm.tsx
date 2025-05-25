
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui-custom/Button";
import Input from "@/components/ui-custom/Input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const blockedEmailDomains = [
  "@gmail.com",
  "@yahoo.com",
  "@hotmail.com",
  "@outlook.com",
  "@live.com",
  "@icloud.com",
  "@aol.com",
  "@mail.com",
  "@msn.com",
  "@protonmail.com",
  "@yandex.com",
  "@zoho.com",
  "@gmx.com",
  "@fastmail.com",
  "@tutanota.com",
  "@me.com",
  "@pm.me"
];

const signUpSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z
    .string()
    .email("Please enter a valid email")
    .refine((email) => {
      const isBlocked = blockedEmailDomains.some(domain => 
        email.toLowerCase().endsWith(domain.toLowerCase())
      );
      return !isBlocked;
    }, {
      message: "Only corporate email addresses are allowed"
    }),
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

type SignUpFormValues = z.infer<typeof signUpSchema>;

const SignUpForm = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const watchedEmail = watch("email");

  const onSubmit = async (data: SignUpFormValues) => {
    // Double-check email domain before submission
    const isBlockedDomain = blockedEmailDomains.some(domain => 
      data.email.toLowerCase().endsWith(domain.toLowerCase())
    );
    
    if (isBlockedDomain) {
      toast.error("Only corporate email addresses are allowed");
      setError("Only corporate email addresses are allowed");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      // Only pass required fields to signup function
      const success = await signup(
        data.email,
        data.password,
        data.firstName,
        data.lastName
      );

      if (success) {
        // Store email in sessionStorage as a backup
        sessionStorage.setItem("verification_email", data.email);
        navigate(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
      }
    } catch (err) {
      console.error("Signup error:", err);
      
      // Check if the error contains a detail field (from API response)
      const errorObj = err as any;
      
      // Extract error message from various possible formats
      let errorMessage: string;
      
      if (errorObj?.detail && typeof errorObj.detail === 'string') {
        errorMessage = errorObj.detail;
      } else if (errorObj?.message && typeof errorObj.message === 'string') {
        errorMessage = errorObj.message;
      } else if (typeof errorObj === 'string') {
        errorMessage = errorObj;
      } else {
        errorMessage = "An unexpected error occurred during signup. Please try again later.";
      }
      
      // Check if it's an "email already registered" error
      if (errorMessage.toLowerCase().includes('email already registered')) {
        toast.error("This email is already registered.");
        setError("This email is already registered. Please try logging in instead.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          {...register("firstName")}
          error={errors.firstName?.message}
          placeholder="John"
          autoComplete="given-name"
        />
        <Input
          label="Last Name"
          {...register("lastName")}
          error={errors.lastName?.message}
          placeholder="Doe"
          autoComplete="family-name"
        />
      </div>
      
      <Input
        label="Email"
        type="email"
        {...register("email")}
        error={errors.email?.message}
        placeholder="you@company.com"
        autoComplete="email"
      />
      
      <Input
        label="Password"
        type="password"
        {...register("password")}
        error={errors.password?.message}
        placeholder="••••••••"
        autoComplete="new-password"
      />
      
      <Input
        label="Confirm Password"
        type="password"
        {...register("confirmPassword")}
        error={errors.confirmPassword?.message}
        placeholder="••••••••"
        autoComplete="new-password"
      />
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <Button
        type="submit"
        className="w-full mt-6"
        size="lg"
        loading={isSubmitting}
      >
        Create Account
      </Button>
    </form>
  );
};

export default SignUpForm;
