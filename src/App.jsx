import { useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import MarqueeBanner from "./components/MarqueeBanner";
import CollectionsSection from "./components/CollectionsSection";
import TrustSection from "./components/TrustSection";
import NewsletterSection from "./components/NewsletterSection";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import FloatingContactButtons from "./components/FloatingContactButtons";
import DubaiShowcaseSection from "./components/DubaiShowcaseSection";
import CollectionPage from "./components/CollectionPage";
import { clearStoredUser, loadStoredUser, storeUser } from "./lib/auth";

function HomePage({ onShopClick }) {
  return (
    <>
      <HeroSection onShopClick={onShopClick} />
      <MarqueeBanner />
      <CollectionsSection />
      <DubaiShowcaseSection />
      <TrustSection />
      <NewsletterSection />
    </>
  );
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [authModal, setAuthModal] = useState(null); // null | "login" | "register"
  const [user, setUser] = useState(null);
  const [ordersModal, setOrdersModal] = useState(null); // null | "guest" | "user"
  const [orderLookupNumber, setOrderLookupNumber] = useState("");

  useEffect(() => {
    setUser(loadStoredUser());
  }, []);

  const handleAuthSuccess = (userData) => {
    storeUser(userData);
    setUser(userData);
    setAuthModal(null);
  };

  const handleLogout = () => {
    clearStoredUser();
    setUser(null);
  };

  const handleOrdersClick = () => {
    setOrdersModal(user ? "user" : "guest");
  };

  const activeNav = ordersModal ? "orders" : location.pathname === "/collections" ? "collections" : "home";

  return (
    <div className="bg-white min-h-screen">
      <Navbar
        user={user}
        onLoginClick={() => setAuthModal("login")}
        onRegisterClick={() => setAuthModal("register")}
        onLogout={handleLogout}
        onOrdersClick={handleOrdersClick}
        onCollectionsClick={() => navigate("/collections")}
        onNewArrivalsClick={() => navigate("/")}
        activeNav={activeNav}
      />
      <Routes>
        <Route path="/" element={<HomePage onShopClick={() => setAuthModal("register")} />} />
        <Route path="/collections" element={<CollectionPage />} />
      </Routes>
      <Footer />
      <FloatingContactButtons />

      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onSwitch={(mode) => setAuthModal(mode)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {ordersModal && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-[#C9A14A]/30 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[#C9A14A]/20">
              <h3
                className="text-xl text-[#0A0A0A]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Orders
              </h3>
              <button onClick={() => setOrdersModal(null)} className="text-lg text-[#333333] hover:text-[#0A0A0A]" aria-label="Close">
                ×
              </button>
            </div>

            <div className="p-4 sm:p-5">
              {ordersModal === "guest" ? (
                <div className="text-center space-y-4">
                  <p
                    className="text-lg text-[#C9A14A] font-semibold"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    Please login to check with your order.
                  </p>
                  <p className="text-[12px] text-[#666666]">Premium support is available for signed-in customers.</p>
                  <button
                    onClick={() => {
                      setOrdersModal(null);
                      setAuthModal("login");
                    }}
                    className="bg-[#C9A14A] hover:bg-[#E8C97A] text-[#0A0A0A] text-[11px] font-semibold tracking-[0.12em] uppercase px-5 py-2.5 rounded-full transition-colors"
                  >
                    Login Now
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[13px] text-[#333333]">Please input the order number to check with your order.</p>
                  <input
                    type="text"
                    value={orderLookupNumber}
                    onChange={(event) => setOrderLookupNumber(event.target.value)}
                    placeholder="Enter order number (e.g. ZOSE-123456)"
                    className="w-full border border-[#C9A14A]/30 focus:border-[#C9A14A] outline-none rounded-lg px-3 py-2.5 text-[13px]"
                  />
                  <button className="w-full bg-[#C9A14A] hover:bg-[#E8C97A] text-[#0A0A0A] text-[11px] font-semibold tracking-[0.12em] uppercase py-2.5 rounded-full transition-colors">
                    Check Order
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
