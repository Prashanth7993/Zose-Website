import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import CollectionsSection from "./components/CollectionsSection";
import TrustSection from "./components/TrustSection";
import NewsletterSection from "./components/NewsletterSection";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import FloatingContactButtons from "./components/FloatingContactButtons";
import DubaiShowcaseSection from "./components/DubaiShowcaseSection";
import CollectionPage from "./components/CollectionPage";
import NewArrivalsPage from "./components/NewArrivalsPage";
import BestsellersPage from "./components/BestsellersPage";
import SalePage from "./components/SalePage";
import AboutPage from "./components/AboutPage";
import ShippingPage from "./components/ShippingPage";
import ReturnsPage from "./components/ReturnsPage";
import AdminPage from "./components/AdminPage";
import OrderTrackingPage from "./components/OrderTrackingPage";
import MyOrdersPage from "./components/MyOrdersPage";
import { clearStoredSession, fetchProducts, loadStoredUser, storeAuthSession } from "./lib/auth";

const mapApiProductToCard = (product) => ({
  id: product.id,
  name: product.name,
  description: product.description,
  desc: product.description,
  actualPrice: Number(product.actualPrice),
  originalPrice: Number(product.actualPrice),
  offerPrice: Number(product.offerPrice),
  sizes: Array.isArray(product.sizes) ? product.sizes : [],
  images: Array.isArray(product.images) ? product.images : [],
  colorImageMap: product.colorImageMap && typeof product.colorImageMap === "object" ? product.colorImageMap : {},
  colors: product.colorImageMap ? Object.keys(product.colorImageMap) : [],
  badge: "Collection",
  tag: null,
});

function HomePage({ onShopClick, onCollectionsClick, products, isProductsLoading }) {
  return (
    <>
      <HeroSection onShopClick={onShopClick} onCollectionsClick={onCollectionsClick} />
      <CollectionsSection products={products} />
      {isProductsLoading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-6 text-[13px] text-[#555555]">
          Loading products from database...
        </div>
      )}
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
  const [user, setUser] = useState(() => loadStoredUser());
  const [ordersModal, setOrdersModal] = useState(null); // null | "guest" | "user"
  const [orderLookupNumber, setOrderLookupNumber] = useState("");
  const [products, setProducts] = useState([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);

  const loadProducts = async () => {
    setIsProductsLoading(true);
    try {
      const response = await fetchProducts();
      setProducts((response.products || []).map(mapApiProductToCard));
    } catch {
      setProducts([]);
    } finally {
      setIsProductsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAuthSuccess = (authResponse) => {
    storeAuthSession(authResponse);
    setUser(authResponse.user);
    setAuthModal(null);
    if (authResponse.user?.isAdmin) {
      navigate("/admin/products");
    }
  };

  const handleLogout = () => {
    clearStoredSession();
    setUser(null);
    if (location.pathname.startsWith("/admin")) {
      navigate("/");
    }
  };

  const handleOrdersClick = () => {
    setOrdersModal(user ? "user" : "guest");
  };

  const activeNav = ordersModal
    ? "orders"
    : location.pathname.startsWith("/collections")
      ? "collections"
      : location.pathname.startsWith("/new-arrivals")
        ? "newArrivals"
        : location.pathname.startsWith("/bestsellers")
          ? "bestsellers"
          : location.pathname.startsWith("/sale")
            ? "sale"
            : location.pathname.startsWith("/about")
              ? "about"
              : location.pathname.startsWith("/shipping")
                ? "shipping"
                : location.pathname.startsWith("/returns")
                  ? "returns"
                  : "home";

  return (
    <div className="bg-white min-h-screen">
      <Navbar
        user={user}
        onLoginClick={() => setAuthModal("login")}
        onRegisterClick={() => setAuthModal("register")}
        onLogout={handleLogout}
        onOrdersClick={handleOrdersClick}
        onCollectionsClick={() => navigate("/collections")}
        onNewArrivalsClick={() => navigate("/new-arrivals")}
        onBestsellersClick={() => navigate("/bestsellers")}
        onSaleClick={() => navigate("/sale")}
        onAboutClick={() => navigate("/about")}
        onShippingClick={() => navigate("/shipping")}
        onReturnsClick={() => navigate("/returns")}
        activeNav={activeNav}
        hideNavItems={location.pathname.startsWith("/admin")}
      />
      <Routes>
        <Route
          path="/"
          element={<HomePage onShopClick={() => setAuthModal("register")} onCollectionsClick={() => navigate("/collections")} products={products} isProductsLoading={isProductsLoading} />}
        />
        <Route path="/collections" element={<CollectionPage products={products} isLoading={isProductsLoading} />} />
        <Route path="/new-arrivals" element={<NewArrivalsPage products={products} isLoading={isProductsLoading} />} />
        <Route path="/bestsellers" element={<BestsellersPage products={products} isLoading={isProductsLoading} />} />
        <Route path="/sale" element={<SalePage products={products} isLoading={isProductsLoading} />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/shipping" element={<ShippingPage />} />
        <Route path="/returns" element={<ReturnsPage />} />
        <Route path="/track-order" element={<OrderTrackingPage />} />
        <Route path="/my-orders" element={user ? <MyOrdersPage /> : <Navigate to="/" replace />} />
        <Route
          path="/admin/*"
          element={
            user?.isAdmin ? (
              <AdminPage
                onProductSaved={loadProducts}
                onOrdersClick={handleOrdersClick}
                onUnauthorized={() => {
                  clearStoredSession();
                  setUser(null);
                  navigate("/");
                }}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
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
                    Track Your Order
                  </p>
                  <p className="text-[12px] text-[#666666]">Enter your Order ID to check status</p>
                  <input
                    type="text"
                    value={orderLookupNumber}
                    onChange={(event) => setOrderLookupNumber(event.target.value)}
                    placeholder="Enter order number (e.g. ZOSE-123456)"
                    className="w-full border border-[#C9A14A]/30 focus:border-[#C9A14A] outline-none rounded-lg px-3 py-2.5 text-[13px]"
                  />
                  <button
                    onClick={() => {
                      if (orderLookupNumber.trim()) {
                        window.location.href = `/track-order?id=${encodeURIComponent(orderLookupNumber.trim())}`;
                      }
                    }}
                    className="bg-[#C9A14A] hover:bg-[#E8C97A] text-[#0A0A0A] text-[11px] font-semibold tracking-[0.12em] uppercase px-5 py-2.5 rounded-full transition-colors"
                  >
                    Track Order
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center space-y-3">
                    <p
                      className="text-lg text-[#C9A14A] font-semibold"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      Track Your Order
                    </p>
                    <p className="text-[12px] text-[#666666]">Enter your Order ID to check status</p>
                    <input
                      type="text"
                      value={orderLookupNumber}
                      onChange={(event) => setOrderLookupNumber(event.target.value)}
                      placeholder="Enter order number (e.g. ZOSE-123456)"
                      className="w-full border border-[#C9A14A]/30 focus:border-[#C9A14A] outline-none rounded-lg px-3 py-2.5 text-[13px]"
                    />
                    <button
                      onClick={() => {
                        if (orderLookupNumber.trim()) {
                          window.location.href = `/track-order?id=${encodeURIComponent(orderLookupNumber.trim())}`;
                        }
                      }}
                      className="w-full bg-[#C9A14A] hover:bg-[#E8C97A] text-[#0A0A0A] text-[11px] font-semibold tracking-[0.12em] uppercase py-2.5 rounded-full transition-colors"
                    >
                      Track Order
                    </button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#C9A14A]/20"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-3 text-[#777777]">or</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[13px] text-[#333333] text-center">Your orders and order history</p>
                    <button
                      onClick={() => {
                        setOrdersModal(null);
                        navigate("/my-orders");
                      }}
                      className="w-full bg-[#C9A14A] hover:bg-[#E8C97A] text-[#0A0A0A] text-[11px] font-semibold tracking-[0.12em] uppercase py-2.5 rounded-full transition-colors"
                    >
                      View My Orders
                    </button>
                  </div>
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
