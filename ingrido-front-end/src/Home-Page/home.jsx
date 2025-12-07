import "./home.css";

export function HomePage() {
  return (
    <div className="container home">
      <div className="row">
        <div className="col-md-6 left-landing">
          <div className="tagline-pill">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-sparkles"
            >
              <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
              <path d="M20 2v4" />
              <path d="M22 4h-4" />
              <circle cx="4" cy="20" r="2" />
            </svg>
            <span>AI-Powered Meal Planning</span>
          </div>

          <h1>
            Personalized Meal Planning{" "}
            <span style={{ color: "#FF7161" }}>Made Simple</span>
          </h1>
          <p>Local dishes, seasonal meals, health-aware recommendations – all in one place.</p>

          <div className="btn-group">
            <button className="btn btn-lg">Get Started</button>
            <button className="btn btn-lg">Watch Demo</button>
          </div>
        </div>

        <div className="col-md-6 right-landing">
          <div className="card" >
            <img src="/homeImg.jpg" className="card-img-top" alt="Card visual" />
            <div className="card-body">
              <p className="card-text">10,000+ Happy Users</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}