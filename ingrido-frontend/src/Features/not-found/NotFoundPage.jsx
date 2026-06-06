import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { NOT_FOUND_MESSAGES } from "./constants";

const NotFoundPage = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background font-sans">
      <div className="text-center px-4">
        <h1 className="mb-2 text-9xl font-extrabold text-primary/20">404</h1>
        <div className="relative -mt-16">
          <h2 className="mb-4 text-3xl font-bold text-foreground tracking-tight">
            {NOT_FOUND_MESSAGES.TITLE}
          </h2>
          <p className="mb-8 text-foreground max-w-md mx-auto">
            {NOT_FOUND_MESSAGES.DESCRIPTION}
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-secondary hover:-translate-y-0.5"
          >
            {NOT_FOUND_MESSAGES.BUTTON_TEXT}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
