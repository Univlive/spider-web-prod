import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ButtonWithIcon } from "@shared/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="gradient-hero flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md text-center">
        <div className="mb-4 text-8xl font-bold text-primary">404</div>
        <h1 className="mb-4 text-3xl font-bold">Page Not Found</h1>
        <p className="mb-8 text-muted-foreground">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <ButtonWithIcon variant="hero" size="lg">
            Back to Home
          </ButtonWithIcon>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
