import { useState } from "react";

export default function Navbar({
  user,
  onLoginClick,
  onRegisterClick,
  onLogout,
  onOrdersClick,
  onCollectionsClick,
  onNewArrivalsClick,
  activeNav = "home",
  hideNavItems = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const supportEmail = "silverstonetrading2026@gmail.com";
  const supportPhone = "+971 502533578";
  const navItems = hideNavItems
    ? []
    : [
        { label: "Collections", key: "collections" },
        { label: "New Arrivals", key: "newArrivals" },
        { label: "Orders", key: "orders" },
        { label: "About", key: "about" },
      ];

  const handleNavClick = (item) => {
    if (item.key === "collections") onCollectionsClick?.();
    if (item.key === "newArrivals") onNewArrivalsClick?.();
    if (item.key === "orders") onOrdersClick?.();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#C9A14A]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-16 flex items-center justify-between">

        {/* Left Nav Links - responsive text size */}
        <div className="hidden md:flex items-center gap-4 lg:gap-8">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => handleNavClick(item)}
              className={`text-[10px] sm:text-[11px] tracking-[0.12em] uppercase transition-colors duration-200 pb-1 border-b ${
                activeNav === item.key
                  ? "text-[#0A0A0A] border-[#C9A14A]"
                  : "text-[#555555] border-transparent hover:text-[#0A0A0A]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Brand Logo - Center - responsive size */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <span
            className="font-serif text-3xl sm:text-5xl font-bold tracking-[0.3em] text-[#C9A14A]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            ZOSE
          </span>
        </div>

        {/* Right: Auth Buttons or User Menu - responsive */}
        <div className="hidden md:flex items-center gap-2 lg:gap-4">
          {user ? (
            <div className="flex items-center gap-2 lg:gap-4">
              <div className="flex items-center gap-1 lg:gap-2">
                <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-[#C9A14A]/20 border border-[#C9A14A]/40 flex items-center justify-center">
                  <span className="text-[10px] sm:text-[11px] font-semibold text-[#C9A14A]">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-[11px] sm:text-[13px] text-[#0A0A0A]">{user.name}</span>
              </div>
              <button
                onClick={onLogout}
                className="text-[10px] sm:text-[11px] tracking-[0.12em] uppercase text-[#555555] hover:text-[#0A0A0A] transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={onLoginClick}
                className="text-[10px] sm:text-[11px] tracking-[0.12em] uppercase text-[#555555] hover:text-[#0A0A0A] transition-colors px-2 sm:px-3 py-2"
              >
                Sign In
              </button>
              <button
                onClick={onRegisterClick}
                className="bg-[#C9A14A] hover:bg-[#E8C97A] text-[#0A0A0A] text-[10px] sm:text-[11px] font-semibold tracking-[0.14em] uppercase px-3 sm:px-5 py-2 sm:py-2.5 rounded-full transition-colors duration-200"
              >
                Register
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-[#555555] hover:text-[#0A0A0A] ml-auto"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            {menuOpen ? (
              <>
                <line x1="4" y1="4" x2="18" y2="18" stroke="currentColor" strokeWidth="1.5" />
                <line x1="18" y1="4" x2="4" y2="18" stroke="currentColor" strokeWidth="1.5" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="19" y2="6" stroke="currentColor" strokeWidth="1.5" />
                <line x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="1.5" />
                <line x1="3" y1="16" x2="19" y2="16" stroke="currentColor" strokeWidth="1.5" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-[#C9A14A]/20 px-4 sm:px-6 py-4 flex flex-col gap-4">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                handleNavClick(item);
                setMenuOpen(false);
              }}
              className={`text-[11px] sm:text-[12px] tracking-[0.12em] uppercase text-left transition-colors border-l-2 pl-3 ${
                activeNav === item.key
                  ? "text-[#0A0A0A] border-[#C9A14A]"
                  : "text-[#555555] border-transparent hover:text-[#0A0A0A]"
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="border-t border-[#C9A14A]/10 pt-4 space-y-2">
            <a
              href={`mailto:${supportEmail}`}
              className="block text-[10px] tracking-[0.08em] text-[#C9A14A] break-all hover:text-[#0A0A0A] transition-colors"
            >
              {supportEmail}
            </a>
            <a
              href={`tel:${supportPhone.replace(/\s+/g, "")}`}
              className="block text-[10px] tracking-[0.08em] text-[#C9A14A] hover:text-[#0A0A0A] transition-colors"
            >
              {supportPhone}
            </a>
          </div>
          {user ? (
            <div className="border-t border-[#C9A14A]/10 pt-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#C9A14A]/20 border border-[#C9A14A]/40 flex items-center justify-center">
                  <span className="text-[11px] font-semibold text-[#C9A14A]">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-[12px] text-[#0A0A0A]">{user.name}</p>
                  <p className="text-[10px] text-[#888880]">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => { onLogout(); setMenuOpen(false); }}
                className="w-full border border-[#C9A14A]/30 text-[#0A0A0A] text-[10px] sm:text-[11px] tracking-[0.12em] uppercase py-2.5 rounded-full hover:border-[#C9A14A] transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="border-t border-[#C9A14A]/10 pt-4 flex gap-3 flex-col sm:flex-row">
              <button
                onClick={() => { onLoginClick(); setMenuOpen(false); }}
                className="flex-1 border border-[#C9A14A]/30 text-[#0A0A0A] text-[10px] sm:text-[11px] tracking-[0.12em] uppercase py-2.5 rounded-full hover:border-[#C9A14A] transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => { onRegisterClick(); setMenuOpen(false); }}
                className="flex-1 bg-[#C9A14A] hover:bg-[#E8C97A] text-[#0A0A0A] text-[10px] sm:text-[11px] font-semibold tracking-[0.12em] uppercase py-2.5 rounded-full transition-colors"
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
