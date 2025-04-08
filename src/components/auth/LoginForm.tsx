
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui-custom/Button";
import Input from "@/components/ui-custom/Input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [useTestCredentials, setUseTestCredentials] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setLoginError(null);
    
    try {
      console.log("Attempting login with:", data.email);
      
      if (useTestCredentials) {
        // Use test credentials path to work around CORS issues if enabled
        const testUser = findTestUser(data.email, data.password);
        if (testUser) {
          // Continue with the existing login process, which will use test data
          const success = await login(data.email, data.password);
          
          if (success) {
            console.log("Login successful");
            toast.success("Login successful");
            // Navigation is handled in the AuthContext
          } else {
            console.log("Login failed");
            setLoginError("Invalid email or password. Please try again.");
          }
        } else {
          // If credentials don't match any test users
          setLoginError("Invalid credentials. Please use one of the test accounts below or toggle to direct API access.");
        }
      } else {
        // Direct API authentication
        const success = await login(data.email, data.password);
        
        if (success) {
          console.log("Login successful");
          toast.success("Login successful");
          // Navigation is handled in the AuthContext
        } else {
          console.log("Login failed");
          setLoginError("Login failed. This may be due to CORS restrictions with the API. If you continue to experience issues, you can enable test accounts.");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setLoginError(`Authentication error: ${errorMessage}. This is likely due to CORS restrictions with the API. Try using test accounts if needed.`);
      setShowDebugInfo(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const findTestUser = (email: string, password: string): boolean => {
    const testUsers = [
      { email: 'user@example.com', password: 'password' },
      { email: 'admin@example.com', password: 'password' },
      { email: 'manager@example.com', password: 'password' }
    ];
    
    return testUsers.some(user => user.email === email && user.password === password);
  };

  const setTestCredentials = (role: 'user' | 'admin' | 'manager') => {
    switch (role) {
      case 'user':
        setValue('email', 'user@example.com');
        setValue('password', 'password');
        break;
      case 'admin':
        setValue('email', 'admin@example.com');
        setValue('password', 'password');
        break;
      case 'manager':
        setValue('email', 'manager@example.com');
        setValue('password', 'password');
        break;
    }
  };

  return (
    <div className="space-y-4">
      {loginError && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-md flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span>{loginError}</span>
        </div>
      )}
      
      {showDebugInfo && (
        <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-xs font-mono">
          <p className="font-semibold">Debug Info:</p>
          <p>API URL: https://conuage-be-production.up.railway.app</p>
          <p>Possible CORS issue: The API might not allow requests from this origin.</p>
          <p>Solution: You can either use test accounts or have the API configured to allow CORS from this origin.</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          {...register("email")}
          error={errors.email?.message}
          placeholder="you@example.com"
          autoComplete="email"
        />
        
        <div className="space-y-1.5">
          <Input
            label="Password"
            type="password"
            {...register("password")}
            error={errors.password?.message}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <div className="flex justify-end">
            <Link
              to="/auth/forgot-password"
              className="text-xs text-primary hover:underline focus-ring rounded px-1"
            >
              Forgot password?
            </Link>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 mt-2">
          <label className="text-sm text-muted-foreground cursor-pointer flex items-center">
            <input
              type="checkbox"
              checked={useTestCredentials}
              onChange={() => setUseTestCredentials(!useTestCredentials)}
              className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            Use test accounts instead (if you have CORS issues)
          </label>
        </div>
        
        <Button
          type="submit"
          className="w-full mt-6"
          size="lg"
          loading={isSubmitting}
        >
          Sign In
        </Button>
      </form>

      {useTestCredentials && (
        <div className="pt-4 border-t border-border">
          <div className="flex items-start gap-2 p-3 text-sm bg-muted/50 rounded-md">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-foreground">Test Credentials</h3>
              <p className="text-muted-foreground mt-1">
                You can use these test accounts for different roles:
              </p>
              <div className="mt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => setTestCredentials('user')}
                  className="block text-xs bg-background px-2 py-1 rounded border border-input hover:bg-accent w-full text-left"
                >
                  <span className="font-semibold">End User:</span> user@example.com / password
                </button>
                <button
                  type="button"
                  onClick={() => setTestCredentials('admin')}
                  className="block text-xs bg-background px-2 py-1 rounded border border-input hover:bg-accent w-full text-left"
                >
                  <span className="font-semibold">Org Admin:</span> admin@example.com / password
                </button>
                <button
                  type="button"
                  onClick={() => setTestCredentials('manager')}
                  className="block text-xs bg-background px-2 py-1 rounded border border-input hover:bg-accent w-full text-left"
                >
                  <span className="font-semibold">Manager:</span> manager@example.com / password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
