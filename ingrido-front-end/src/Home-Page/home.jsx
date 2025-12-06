import "./home.css";

export function HomePage() {
  return (
    <>
      <div className="container home">
        <div className="row ">
          <div className="col-lg-6 colo-md-12">
            <div className="tagline-pill rounded-pill">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-sparkles-icon lucide-sparkles"
              >
                <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
                <path d="M20 2v4" />
                <path d="M22 4h-4" />
                <circle cx="4" cy="20" r="2" />
              </svg>
              <span>AI-Powered Meal Planning</span>
            </div>
            <h1>Personalized Meal Planning Made Simple</h1>
            <p>
              Local dishes, seasonal meals, health-aware recommendations – all
              in one place.
            </p>

            <button type="button" className="btn btn-lg">
              Get Started
            </button>

            <button type="button" className="btn btn-lg">
              Watch Demo
            </button>
          </div>
          <div className="col-lg-6 colo-md-12">
            <div className="card" style={{ width: "18rem" }}>
              <img
                src="/homeImg.jpg"
                className="card-img-top"
                alt="Card visual"
              />
              <div className="card-body">
                <p className="card-text">10,000+ Happy Users</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
