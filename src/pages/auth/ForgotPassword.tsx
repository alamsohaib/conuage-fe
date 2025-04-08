
import AuthLayout from "@/components/auth/AuthLayout";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

const ForgotPassword = () => {
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
