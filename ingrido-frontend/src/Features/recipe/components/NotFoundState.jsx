import { useNavigate } from "react-router-dom";

const NotFoundState = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center text-black">
      <div className="text-center">
        <p className="mb-4">Recipe not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFoundState;