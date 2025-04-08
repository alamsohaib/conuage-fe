
import AuthLayout from "@/components/auth/AuthLayout";
import VerifyEmailForm from "@/components/auth/VerifyEmailForm";

const VerifyEmail = () => {
  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Enter the verification code we sent to your email"
    >
      <VerifyEmailForm />
    </AuthLayout>
  );
};

export default VerifyEmail;
