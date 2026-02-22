import {Navbar} from "../components/NavBar.jsx"
import {MainLayout} from "../layouts/LandingLayout.jsx"
import {Footer} from "../components/Footer.jsx"

export function LandingPage() {
  return (
    <>
      <Navbar />
      <MainLayout />
      <Footer />
    </>
  );
}
