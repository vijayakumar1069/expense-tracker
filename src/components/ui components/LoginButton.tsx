import { Button } from "@/components/ui/button";

// components/auth/LoginButton.tsx
interface LoginButtonProps {
  isLoading: boolean;
}

export const LoginButton = ({ isLoading }: LoginButtonProps) => {
  return (
    <Button type="submit" className="w-full" disabled={isLoading}>
      {isLoading ? "Signing in..." : "Sign in"}
    </Button>
  );
};
