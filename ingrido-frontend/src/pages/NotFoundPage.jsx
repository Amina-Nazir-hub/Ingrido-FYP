import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background font-sans">
      <div className="text-center px-4">
        <h1 className="mb-2 text-9xl font-extrabold text-primary/20">404</h1>
      <div className="relative -mt-16">
          <h2 className="mb-4 text-3xl font-bold text-foreground tracking-tight">
            Oops! Page not found
          </h2>
          <p className="mb-8 text-muted-foreground max-w-md mx-auto">
            The page you are looking for doesn't exist or has been moved. 
            Don't worry, our recipes are still safe!
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-secondary hover:-translate-y-0.5"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;