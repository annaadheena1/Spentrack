import { useEffect } from "react";
import { useNavigate } from "react-router";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  useEffect(() => {
    const userPhone = localStorage.getItem("userPhone");
    
    if (!userPhone) {
      // Not logged in - redirect to welcome
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const userPhone = localStorage.getItem("userPhone");
  
  // Don't render protected content if not authenticated
  if (!userPhone) {
    return null;
  }

  return <>{children}</>;
}
