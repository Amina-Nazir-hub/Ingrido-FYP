import "./Navbar.css";

export function NavBar() {
  return (
    <>
      <nav className="navbar navbar-expand-lg NavbarStyling fixed-top">
        <div className="container-fluid">
          <a className="navbar-brand title " href="#">
            Ingrido
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNavAltMarkup"
            aria-controls="navbarNavAltMarkup"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div className="navbar-nav w-100 d-flex align-items-center">
              {/* Links container */}
              <a className="nav-link active centerLinks ms-auto" href="#">
                Home
              </a>
              <a
                className="nav-link active centerLinks "
                aria-current="page"
                href="#"
              >
                Features
              </a>
              <a className="nav-link active centerLinks" href="#">
                How It Works
              </a>

              {/* Button pushed to the end */}
              <button type="button" className="btn login-btn btn-lg ms-auto">
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
