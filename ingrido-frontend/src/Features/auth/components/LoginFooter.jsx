import { Link } from "react-router-dom";

const LoginFooter = () => {
  return (
    <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
      Don't have an account?{" "}
      <Link
        to="/register"
        className="text-primary font-bold hover:underline transition-colors"
      >
        Sign Up
      </Link>
    </p>
  );
};

export default LoginFooter;
