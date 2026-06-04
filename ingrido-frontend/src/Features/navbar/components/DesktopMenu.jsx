export const DesktopMenu = ({ children }) => {
  return (
    <div className="hidden md:flex items-center gap-8">
      {children}
    </div>
  );
};