import "./home.css";

export function HomePage() {
  return (
    <>
      <div className="container home">
        <div className="row ">
          <div className="col-lg-6 colo-md-12">
              <span>AI-Powered Meal Planning</span>
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
