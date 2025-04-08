
import { ReactNode } from "react";
import { Link } from "react-router-dom";

type AuthLayoutProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
  footerText?: string;
  footerLink?: {
    text: string;
    to: string;
  };
};

const AuthLayout = ({
  children,
  title,
  subtitle,
  footerText,
  footerLink,
}: AuthLayoutProps) => {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 md:p-8">
      <div className="animate-fade-in w-full max-w-md">
        <div className="glass rounded-2xl shadow-elevated overflow-hidden p-6 md:p-8">
          <div className="mb-6 text-center">
            <h1 className="animate-slide-down text-2xl font-bold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="animate-slide-down animation-delay-100 mt-2 text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>

          <div className="animate-slide-up animation-delay-200">
            {children}
          </div>

          {(footerText || footerLink) && (
            <div className="animate-fade-in animation-delay-300 mt-8 text-center text-sm">
              {footerText && <span className="text-muted-foreground">{footerText} </span>}
              {footerLink && (
                <Link
                  to={footerLink.to}
                  className="text-primary font-medium hover:underline focus-ring rounded"
                >
                  {footerLink.text}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
