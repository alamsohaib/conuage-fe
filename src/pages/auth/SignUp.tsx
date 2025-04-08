
import AuthLayout from "@/components/auth/AuthLayout";
import SignUpForm from "@/components/auth/SignUpForm";

const SignUp = () => {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Sign up to get started with our platform"
      footerText="Already have an account?"
      footerLink={{
        text: "Sign in",
        to: "/auth/login"
      }}
    >
      <SignUpForm />
    </AuthLayout>
  );
};

export default SignUp;
