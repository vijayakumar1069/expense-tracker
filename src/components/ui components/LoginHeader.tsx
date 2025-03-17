// components/auth/LoginHeader.tsx
export const LoginHeader = () => {
  return (
    <div className="text-center space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p className="text-sm text-muted-foreground">
        Enter your email to sign in to your account
      </p>
    </div>
  );
};
