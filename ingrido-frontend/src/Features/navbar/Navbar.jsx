import { useNavbar } from "./hooks/useNavbar";
import { Logo } from "./components/Logo";
import { DesktopMenu } from "./components/DesktopMenu";
import { MobileMenu } from "./components/MobileMenu";
import { MobileMenuButton } from "./components/MobileMenuButton";

export function Navbar() {
  const {
    isLoggedIn,
    loading,
    isOpen,
    toggleMenu,
    closeMenu,
    logout,
    userInfo,
  } = useNavbar();

  if (loading) {
    return <header className="h-16 md:h-20 bg-primary border-b" />;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary backdrop-blur-md border-b border-border/50 h-16 md:h-20 flex items-center">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Logo />

        <DesktopMenu
          isLoggedIn={isLoggedIn}
          displayLetter={userInfo.displayLetter}
          displayName={userInfo.firstName}
        />

        <MobileMenuButton isOpen={isOpen} onToggle={toggleMenu} />
      </div>

      <MobileMenu
        isOpen={isOpen}
        isLoggedIn={isLoggedIn}
        onClose={closeMenu}
        onLogout={logout}
      />
    </header>
  );
}

export default Navbar;
