
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/services/api";
import { Token, User, Profile, UserRole, UpdateProfileRequest } from "@/lib/types";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userRole: UserRole | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, firstName?: string, lastName?: string) => Promise<boolean>;
  verifyEmail: (email: string, code: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (email: string, code: string, password: string) => Promise<boolean>;
  regenerateVerificationCode: (email: string) => Promise<boolean>;
  updateProfile: (data: UpdateProfileRequest) => Promise<boolean>;
  updateProfilePhoto: (photo: File) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const testUsers = {
  endUser: {
    email: "user@example.com",
    password: "password",
    profile: {
      id: "test-user-id",
      email: "user@example.com",
      first_name: "Test",
      last_name: "User",
      role: "end_user" as UserRole,
      status: "active",
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      locations: [
        {
          location_id: "loc-1",
          location_name: "Main Office",
          is_primary: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          location_id: "loc-2",
          location_name: "Branch Office",
          is_primary: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ]
    },
    user: {
      id: "test-user-id",
      email: "user@example.com",
      firstName: "Test",
      lastName: "User",
      isEmailVerified: true,
      status: "active" as "active" | "inactive",
      role: "end_user" as UserRole,
    }
  },
  orgAdmin: {
    email: "admin@example.com",
    password: "password",
    profile: {
      id: "test-admin-id",
      email: "admin@example.com",
      first_name: "Admin",
      last_name: "User",
      role: "org_admin" as UserRole,
      status: "active",
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      locations: [
        {
          location_id: "loc-1",
          location_name: "Main Office",
          is_primary: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          location_id: "loc-2",
          location_name: "Branch Office",
          is_primary: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          location_id: "loc-3",
          location_name: "Satellite Office",
          is_primary: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ]
    },
    user: {
      id: "test-admin-id",
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      isEmailVerified: true,
      status: "active" as "active" | "inactive",
      role: "org_admin" as UserRole,
    }
  },
  manager: {
    email: "manager@example.com",
    password: "password",
    profile: {
      id: "test-manager-id",
      email: "manager@example.com",
      first_name: "Manager",
      last_name: "User",
      role: "manager" as UserRole,
      status: "active",
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      locations: [
        {
          location_id: "loc-2",
          location_name: "Branch Office",
          is_primary: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ]
    },
    user: {
      id: "test-manager-id",
      email: "manager@example.com",
      firstName: "Manager",
      lastName: "User",
      isEmailVerified: true,
      status: "active" as "active" | "inactive",
      role: "manager" as UserRole,
    }
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const storedToken = localStorage.getItem("authToken");
      
      if (storedToken) {
        setToken(storedToken);
        try {
          const profileResponse = await api.auth.getProfile();
          if (profileResponse.data) {
            setProfile(profileResponse.data);
            setUserRole(profileResponse.data.role);
            
            if (profileResponse.data) {
              const userFromProfile: User = {
                id: profileResponse.data.id,
                email: profileResponse.data.email,
                firstName: profileResponse.data.first_name,
                lastName: profileResponse.data.last_name,
                isEmailVerified: profileResponse.data.email_verified,
                status: profileResponse.data.status as "active" | "inactive",
                role: profileResponse.data.role
              };
              setUser(userFromProfile);
              setIsAuthenticated(true);
            }
          } else if (profileResponse.error) {
            localStorage.removeItem("authToken");
            setToken(null);
            setProfile(null);
            setUserRole(null);
          }
        } catch (error) {
          console.error("Auth check failed:", error);
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuthStatus();
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const refreshProfile = async (): Promise<void> => {
    const storedToken = localStorage.getItem("authToken");
    if (!storedToken) return;

    console.log("Refreshing profile...");
    
    try {
      if (storedToken.startsWith("test-token-")) {
        const testUser = Object.values(testUsers).find(
          (user) => user.email === profile?.email
        );
        
        if (testUser) {
          console.log("Using test user profile:", testUser.profile);
          setProfile(testUser.profile);
          setUserRole(testUser.profile.role);
          return;
        }
      }
      
      const { data, error } = await api.auth.getProfile();
      
      if (data) {
        console.log("Profile refreshed:", data);
        setProfile(data);
        setUserRole(data.role);
      } else if (error) {
        console.error("Failed to refresh profile:", error);
        toast.error("Failed to refresh profile data");
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    console.log(`Attempting to login with username: ${username}`);
    
    const testUser = Object.values(testUsers).find(
      user => user.email === username && user.password === password
    );
    
    if (testUser) {
      console.log("Found matching test user:", testUser.email);
      const mockToken = "test-token-" + Math.random().toString(36).substring(2);
      localStorage.setItem("authToken", mockToken);
      setToken(mockToken);
      setProfile(testUser.profile);
      setUserRole(testUser.profile.role);
      setUser(testUser.user);
      setIsAuthenticated(true);
      setIsLoading(false);
      
      toast.success("Logged in successfully with test account");
      
      if (testUser.profile.role === 'end_user') {
        navigate("/chat");
      } else if (testUser.profile.role === 'org_admin' || testUser.profile.role === 'manager') {
        navigate("/dashboard");
      } else {
        navigate("/dashboard");
      }
      
      return true;
    }
    
    try {
      console.log("Making API login request for:", username);
      const { data, error } = await api.auth.login({ username, password });
      
      if (data) {
        console.log("Login API response successful:", data);
        localStorage.setItem("authToken", data.access_token);
        setToken(data.access_token);
        
        const profileResponse = await api.auth.getProfile();
        if (profileResponse.data) {
          console.log("Profile data retrieved:", profileResponse.data);
          setProfile(profileResponse.data);
          setUserRole(profileResponse.data.role);
          
          const userFromProfile: User = {
            id: profileResponse.data.id,
            email: profileResponse.data.email,
            firstName: profileResponse.data.first_name,
            lastName: profileResponse.data.last_name,
            isEmailVerified: profileResponse.data.email_verified,
            status: profileResponse.data.status as "active" | "inactive",
            role: profileResponse.data.role
          };
          
          setUser(userFromProfile);
          setIsAuthenticated(true);
          toast.success("Logged in successfully");

          if (profileResponse.data?.role === 'end_user') {
            navigate("/chat");
          } else if (profileResponse.data?.role === 'org_admin' || profileResponse.data?.role === 'manager') {
            navigate("/dashboard");
          } else {
            navigate("/dashboard");
          }
          
          return true;
        } else {
          console.error("Failed to get profile after login:", profileResponse.error);
          toast.error("Failed to retrieve user profile");
        }
      } else if (error) {
        console.error("Login API error:", error);
        toast.error(error.message || "Login failed");
      }
      
      return false;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Call API logout endpoint
      await api.auth.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear all auth-related data
      localStorage.removeItem("authToken");
      
      // Reset all state values
      setUser(null);
      setProfile(null);
      setToken(null);
      setUserRole(null);
      setIsAuthenticated(false);
      
      setIsLoading(false);
      
      // Navigate to home page
      navigate("/", { replace: true });
      toast.success("Logged out successfully");
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    firstName?: string, 
    lastName?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await api.auth.signUp({ email, password, firstName, lastName });
      
      if (error) {
        toast.error(error.message || "Signup failed");
        return false;
      }
      
      toast.success("Account created! Please verify your email");
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("An unexpected error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (email: string, code: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await api.auth.verifyEmail({ email, code });
      
      if (error) {
        toast.error(error.message || "Email verification failed");
        return false;
      }
      
      toast.success("Email verified successfully");
      return true;
    } catch (error) {
      console.error("Verify email error:", error);
      toast.error("An unexpected error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await api.auth.forgotPassword({ email });
      
      if (error) {
        toast.error(error.message || "Failed to send reset email");
        return false;
      }
      
      toast.success("Password reset instructions sent to your email");
      return true;
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("An unexpected error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string, code: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await api.auth.resetPassword({ email, code, password });
      
      if (error) {
        toast.error(error.message || "Password reset failed");
        return false;
      }
      
      toast.success("Password reset successfully");
      return true;
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("An unexpected error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateVerificationCode = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await api.auth.regenerateVerificationCode(email);
      
      if (error) {
        toast.error(error.message || "Failed to send new verification code");
        return false;
      }
      
      toast.success("New verification code sent to your email");
      return true;
    } catch (error) {
      console.error("Regenerate code error:", error);
      toast.error("An unexpected error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: UpdateProfileRequest): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data: updatedProfile, error } = await api.auth.updateProfile(data);
      
      if (error) {
        toast.error(error.message || "Profile update failed");
        return false;
      }
      
      if (updatedProfile) {
        setProfile(updatedProfile);
        
        if (user) {
          setUser({
            ...user,
            firstName: updatedProfile.first_name,
            lastName: updatedProfile.last_name,
          });
        }
        
        toast.success("Profile updated successfully");
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("An unexpected error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfilePhoto = async (photo: File): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await api.auth.updateProfilePhoto(photo);
      
      if (error) {
        toast.error(error.message || "Profile photo update failed");
        return false;
      }
      
      await refreshProfile();
      
      toast.success("Profile photo updated successfully");
      return true;
    } catch (error) {
      console.error("Profile photo update error:", error);
      toast.error("An unexpected error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    profile,
    token,
    isAuthenticated,
    isLoading,
    userRole,
    login,
    logout,
    signup,
    verifyEmail,
    forgotPassword,
    resetPassword,
    regenerateVerificationCode,
    updateProfile,
    updateProfilePhoto,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
