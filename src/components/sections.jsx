import { useEffect, useMemo, useState } from "react";
import dubai1 from "../assets/dubai1.png";
import dubai2 from "../assets/dubai2.png";
import duabi3 from "../assets/duabi3.png";
import dubai4 from "../assets/dubai4.png";
import dubai5 from "../assets/dubai5.png";
import zoseLogo from "../assets/zose.jpeg";

// MarqueeBanner.jsx
export function MarqueeBanner() {
  const text =
    "FREE SHIPPING ACROSS UAE  ·  PREMIUM QUALITY GUARANTEED  ·  EXPRESS DELIVERY IN 24H  ·  EASY RETURNS  ·  ";
  return (
    <div className="bg-[#C9A14A] py-2 sm:py-3 overflow-hidden whitespace-nowrap">
      <span
        className="text-[9px] sm:text-[10px] lg:text-[11px] font-semibold tracking-[0.22em] uppercase text-[#0A0A0A]"
        style={{ animation: "marquee 20s linear infinite", display: "inline-block" }}
      >
        {text.repeat(4)}
      </span>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

// CollectionsSection.jsx
const collections = [
  {
    id: 1,
    badge: "Bestseller",
    name: "Heritage Series",
    desc: "Premium UAE fit t-shirt with breathable feel for all-day comfort.",
    originalPrice: 179,
    offerPrice: 149,
    accent: "from-[#1a1506] to-[#2a200a]",
    letterColor: "text-[#C9A14A]/30",
    tag: null,
  },
  {
    id: 2,
    badge: "New Arrival",
    name: "City Pulse Series",
    desc: "Street-inspired t-shirt made for modern city movement and comfort.",
    originalPrice: 199,
    offerPrice: 179,
    accent: "from-[#0a0a1a] to-[#12102a]",
    letterColor: "text-purple-400/30",
    tag: "New",
  },
  {
    id: 3,
    badge: "Sustainable",
    name: "Green Earth Series",
    desc: "Soft premium t-shirt with durable finish and clean everyday styling.",
    originalPrice: 229,
    offerPrice: 199,
    accent: "from-[#0a1a0a] to-[#0f2010]",
    letterColor: "text-green-400/25",
    tag: null,
  },
];

export function CollectionsSection() {
  const colorOptions = ["Black", "White", "Merun", "Sky blue", "Bottle green", "Navy blue"];
  const sizeOptions = ["M", "L", "XL", "2XL", "3XL"];
  const sizeChart = useMemo(
    () => [
      { size: "M", length: '29 1/2"', width: '21 1/2"', sleeve: '7 1/2"' },
      { size: "L", length: '30 1/2"', width: '22 1/2"', sleeve: '7 1/2"' },
      { size: "XL", length: '31 1/2"', width: '23 1/2"', sleeve: '8"' },
      { size: "2XL", length: '32 1/2"', width: '24 1/2"', sleeve: '8 1/2"' },
      { size: "3XL", length: '33 1/2"', width: '26"', sleeve: '9"' },
    ],
    []
  );
  const whatsappPhone = "971502533578";
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [selectedSize, setSelectedSize] = useState(sizeOptions[0]);
  const [quantity, setQuantity] = useState(1);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [activeCardImageIndex, setActiveCardImageIndex] = useState(0);
  const [activePopupImageIndex, setActivePopupImageIndex] = useState(0);
  const tshirtImages = [dubai1, dubai2, duabi3, dubai4, dubai5];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveCardImageIndex((current) => (current + 1) % tshirtImages.length);
    }, 2800);
    return () => window.clearInterval(timer);
  }, [tshirtImages.length]);

  const openOrderPopup = (product) => {
    setSelectedProduct(product);
    setSelectedColor(colorOptions[0]);
    setSelectedSize(sizeOptions[0]);
    setQuantity(1);
    setActivePopupImageIndex(0);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
  };

  const closeOrderPopup = () => setSelectedProduct(null);

  const handleConfirmOrder = () => {
    if (!selectedProduct) return;
    const orderNumber = `ZOSE-${Date.now().toString().slice(-6)}`;
    const totalAmount = selectedProduct.offerPrice * quantity;
    const orderMessage = [
      "Hello ZOSE, I would like to place an order.",
      `Order Number: ${orderNumber}`,
      `Product: ${selectedProduct.name}`,
      `Description: ${selectedProduct.desc}`,
      `Customer Name: ${customerName || "Not provided"}`,
      `Customer Phone: ${customerPhone || "Not provided"}`,
      `Customer Address: ${customerAddress || "Not provided"}`,
      `Color: ${selectedColor}`,
      `Size: ${selectedSize}`,
      "Fabric: Honeycomb Cotton",
      "GSM: 240",
      "Material: Cotton",
      `Quantity: ${quantity}`,
      `Actual Price: AED ${selectedProduct.originalPrice}`,
      `Offer Price: AED ${selectedProduct.offerPrice}`,
      `Total Amount: AED ${totalAmount}`,
      "Payment Mode: COD",
    ].join("\n");
    window.open(`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(orderMessage)}`, "_blank");
    closeOrderPopup();
    setOrderSuccessMessage(`Order successful. Your order number is ${orderNumber}.`);
    window.setTimeout(() => setOrderSuccessMessage(""), 5000);
  };

  return (
    <>
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-10 lg:mb-14">
          <p className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-[#C9A14A] mb-2 sm:mb-3">Featured</p>
          <h2
            className="text-2xl sm:text-3xl lg:text-[42px] font-light text-[#0A0A0A] tracking-wide"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Our Collections
          </h2>
          <div className="w-8 sm:w-10 lg:w-12 h-px mx-auto mt-3 sm:mt-4 bg-gradient-to-r from-transparent via-[#C9A14A] to-transparent" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {collections.map((col) => (
            <div
              key={col.id}
              className="bg-white border border-[#C9A14A]/20 hover:border-[#C9A14A]/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <div className={`h-40 sm:h-48 lg:h-56 bg-gradient-to-br ${col.accent} border-b border-[#C9A14A]/10 relative overflow-hidden`}>
                {col.tag && (
                  <span className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-[#C9A14A] text-[#0A0A0A] text-[9px] sm:text-[10px] font-semibold tracking-[0.14em] uppercase px-2 sm:px-3 py-1">
                    {col.tag}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/20 z-10" />
                <div className="absolute inset-0 z-0">
                  {tshirtImages.map((imageSrc, index) => (
                    <img
                      key={`${col.id}-${imageSrc}`}
                      src={imageSrc}
                      alt={`${col.name} preview`}
                      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                        activeCardImageIndex === index ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  ))}
                </div>
                <div className="absolute inset-0 z-20 flex items-center justify-center">
                  <div className="text-center">
                    <span
                      className={`text-3xl sm:text-4xl lg:text-[52px] font-light block ${col.letterColor}`}
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      Z
                    </span>
                    <span className="text-[9px] sm:text-[10px] tracking-[0.2em] text-white uppercase">
                      {col.badge === "New Arrival" ? "Urban Line" : col.badge === "Sustainable" ? "Eco Line" : "Classic Line"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 lg:p-6">
                <p className="text-[9px] sm:text-[10px] tracking-[0.16em] uppercase text-[#C9A14A] mb-2">{col.badge}</p>
                <h3
                  className="text-lg sm:text-xl lg:text-[21px] font-normal text-[#0A0A0A] mb-2"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {col.name}
                </h3>
                <p className="text-[11px] sm:text-[12px] lg:text-[13px] text-[#333333] leading-relaxed mb-4 sm:mb-5">{col.desc}</p>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[14px] sm:text-[15px] text-[#333333]/60 line-through">AED {col.originalPrice}</span>
                    <span className="text-[13px] sm:text-[14px] text-[#C9A14A] font-semibold">AED</span>
                    <span className="text-[15px] sm:text-[16px] leading-none text-[#C9A14A]" style={{ fontFamily: "'Outfit', sans-serif" }}>{col.offerPrice}</span>
                    <span className="text-[12px] sm:text-[13px] font-semibold text-emerald-600">
                      {Math.round(((col.originalPrice - col.offerPrice) / col.originalPrice) * 100)}% OFF
                    </span>
                  </div>
                  <button
                    onClick={() => openOrderPopup(col)}
                    className="bg-[#C9A14A] hover:bg-[#E8C97A] text-[#0A0A0A] text-[9px] sm:text-[10px] font-semibold tracking-[0.14em] uppercase px-3 sm:px-5 py-2 rounded-full transition-colors"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-[#C9A14A]/30 shadow-2xl">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#C9A14A]/20">
              <h3 className="text-xl sm:text-2xl text-[#0A0A0A]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {selectedProduct.name}
              </h3>
              <button onClick={closeOrderPopup} className="text-[#333333] hover:text-[#0A0A0A] text-lg" aria-label="Close">
                ×
              </button>
            </div>
            <div className="p-4 sm:p-5 lg:p-6 space-y-5">
              <p className="text-[12px] tracking-[0.16em] uppercase text-[#C9A14A] mb-2 font-semibold">Description</p>
              <p className="text-[13px] text-[#333333]">
                {selectedProduct.desc} Crafted in Honeycomb Cotton with 240 GSM premium build quality for long-lasting comfort and structure.
              </p>
              <div className="rounded-xl border border-[#C9A14A]/20 overflow-hidden bg-[#f7f8fb]">
                <div className="relative aspect-[4/3] sm:aspect-[16/10]">
                  {tshirtImages.map((imageSrc, index) => (
                    <img
                      key={`popup-${imageSrc}`}
                      src={imageSrc}
                      alt="T-shirt preview"
                      className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ${
                        activePopupImageIndex === index ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  ))}
                  <button
                    onClick={() =>
                      setActivePopupImageIndex((current) => (current - 1 + tshirtImages.length) % tshirtImages.length)
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-[#C9A14A]/30 text-[#0A0A0A]"
                    aria-label="Previous image"
                  >
                    {"<"}
                  </button>
                  <button
                    onClick={() => setActivePopupImageIndex((current) => (current + 1) % tshirtImages.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-[#C9A14A]/30 text-[#0A0A0A]"
                    aria-label="Next image"
                  >
                    {">"}
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/80 px-2 py-1 rounded-full">
                    {tshirtImages.map((_, index) => (
                      <button
                        key={`dot-${index}`}
                        onClick={() => setActivePopupImageIndex(index)}
                        className={`w-2.5 h-2.5 rounded-full ${
                          activePopupImageIndex === index ? "bg-[#C9A14A]" : "bg-[#C9A14A]/30"
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[12px] tracking-[0.16em] uppercase text-[#C9A14A] mb-2 font-semibold">Available Colors</p>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1.5 rounded-full border text-[11px] ${
                        selectedColor === color
                          ? "bg-[#C9A14A] text-[#0A0A0A] border-[#C9A14A]"
                          : "bg-white text-[#333333] border-[#C9A14A]/30"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[12px] tracking-[0.16em] uppercase text-[#C9A14A] mb-2 font-semibold">Select Size</p>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-10 rounded-md border text-[12px] font-semibold ${
                        selectedSize === size
                          ? "bg-[#C9A14A] text-[#0A0A0A] border-[#C9A14A]"
                          : "bg-white text-[#333333] border-[#C9A14A]/30"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[12px] tracking-[0.16em] uppercase text-[#C9A14A] mb-2 font-semibold">Size Chart (Inches)</p>
                <div className="border border-[#C9A14A]/20 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-4 bg-[#f4f7fb] text-[11px] font-medium text-[#0A0A0A]">
                    <span className="p-2">Size</span>
                    <span className="p-2">Length</span>
                    <span className="p-2">Width</span>
                    <span className="p-2">Sleeve</span>
                  </div>
                  {sizeChart.map((row) => (
                    <div key={row.size} className="grid grid-cols-4 text-[11px] text-[#333333] border-t border-[#C9A14A]/10">
                      <span className="p-2">{row.size}</span>
                      <span className="p-2">{row.length}</span>
                      <span className="p-2">{row.width}</span>
                      <span className="p-2">{row.sleeve}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 border border-[#C9A14A]/20 rounded-lg p-3">
                <div>
                  <p className="text-[12px] tracking-[0.16em] uppercase text-[#C9A14A] mb-1 font-semibold">Price</p>
                  <p className="text-[12px] text-[#333333]/60 line-through">AED {selectedProduct.originalPrice}</p>
                  <p className="text-[18px] text-[#0A0A0A] font-semibold">
                    AED{" "}
                    <span style={{ fontFamily: "'Outfit', sans-serif" }}>{selectedProduct.offerPrice * quantity}</span>
                  </p>
                </div>
                <div>
                  <p className="text-[12px] tracking-[0.16em] uppercase text-[#C9A14A] mb-1 font-semibold">Quantity</p>
                  <div className="flex items-center border border-[#C9A14A]/30 rounded-md">
                    <button onClick={() => setQuantity((c) => Math.max(1, c - 1))} className="w-9 h-9 text-[#0A0A0A] hover:bg-[#f8f9fb]">
                      -
                    </button>
                    <span className="w-10 text-center text-[13px] font-medium">{quantity}</span>
                    <button onClick={() => setQuantity((c) => c + 1)} className="w-9 h-9 text-[#0A0A0A] hover:bg-[#f8f9fb]">
                      +
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  placeholder="Your name"
                  className="border border-[#C9A14A]/30 rounded-lg px-3 py-2.5 text-[12px] text-[#0A0A0A] outline-none focus:border-[#C9A14A]"
                />
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  placeholder="Your phone number"
                  className="border border-[#C9A14A]/30 rounded-lg px-3 py-2.5 text-[12px] text-[#0A0A0A] outline-none focus:border-[#C9A14A]"
                />
                <textarea
                  value={customerAddress}
                  onChange={(event) => setCustomerAddress(event.target.value)}
                  placeholder="Delivery address"
                  rows={3}
                  className="sm:col-span-2 border border-[#C9A14A]/30 rounded-lg px-3 py-2.5 text-[12px] text-[#0A0A0A] outline-none focus:border-[#C9A14A] resize-none"
                />
              </div>
              <button
                onClick={handleConfirmOrder}
                className="w-full bg-[#C9A14A] hover:bg-[#E8C97A] text-[#0A0A0A] py-3 rounded-full text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors"
              >
                Confirm Order (COD) on WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
      {orderSuccessMessage && (
        <div className="fixed bottom-5 right-5 z-[55] bg-[#0A0A0A] text-white border border-[#C9A14A]/40 px-4 py-3 rounded-lg shadow-xl max-w-sm">
          <p className="text-[12px] sm:text-[13px]">{orderSuccessMessage}</p>
        </div>
      )}
    </>
  );
}

// TrustSection.jsx
const trustItems = [
  { icon: "🇦🇪", title: "Made for UAE", desc: "Designed specifically for the UAE climate and culture" },
  { icon: "⚡", title: "Fast Delivery", desc: "24–48hr express delivery to all 7 emirates" },
  { icon: "✦", title: "Premium Quality", desc: "100% premium cotton, tested for UAE heat" },
  { icon: "↩", title: "Easy Returns", desc: "Hassle-free 14-day return policy, no questions asked" },
];

export function TrustSection() {
  return (
    <section className="bg-[#f8f9fb] border-t border-b border-[#C9A14A]/20 py-12 sm:py-14 lg:py-16 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 sm:gap-4 mb-8 sm:mb-10 lg:mb-12">
          <div className="flex-1 h-px bg-[#C9A14A]/15" />
          <span className="text-[10px] sm:text-[11px] tracking-[0.22em] uppercase text-[#333333] whitespace-nowrap">UAE Trusted Brand</span>
          <div className="flex-1 h-px bg-[#C9A14A]/15" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {trustItems.map((item) => (
            <div key={item.title} className="text-center">
              <div className="w-10 sm:w-11 lg:w-12 h-10 sm:h-11 lg:h-12 border border-[#C9A14A]/25 flex items-center justify-center text-lg sm:text-xl mx-auto mb-3 sm:mb-4">
                {item.icon}
              </div>
              <h4 className="text-[12px] sm:text-[13px] font-medium text-[#0A0A0A] mb-1 sm:mb-2">{item.title}</h4>
              <p className="text-[11px] sm:text-[12px] text-[#333333] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// NewsletterSection.jsx
export function NewsletterSection() {
  const supportEmail = "silverstonetrading2026@gmail.com";
  const supportPhone = "+971 502533578";

  return (
    <section
      className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 text-center"
      style={{
        backgroundImage:
          "repeating-linear-gradient(45deg,rgba(201,161,74,.04) 0,rgba(201,161,74,.04) 1px,transparent 0,transparent 50%)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="max-w-lg mx-auto">
        <p className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-[#C9A14A] mb-3 sm:mb-4">Stay in the Loop</p>
        <h2
          className="text-2xl sm:text-3xl lg:text-[36px] font-light text-[#0A0A0A] mb-2 sm:mb-3"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Join the Zose Circle
        </h2>
        <p className="text-[12px] sm:text-[13px] lg:text-[14px] text-[#333333] leading-relaxed mb-6 sm:mb-9 px-2">
          Get early access to new collections, exclusive UAE deals, and style inspiration.
        </p>
        <div className="flex flex-col sm:flex-row border border-[#C9A14A]/20 rounded-lg overflow-hidden">
          <input
            type="email"
            placeholder="Your email address"
            className="flex-1 bg-transparent px-4 sm:px-5 py-3 sm:py-3.5 text-[12px] sm:text-[13px] text-[#0A0A0A] placeholder:text-[#777] outline-none border-b sm:border-b-0 sm:border-r border-[#C9A14A]/20 focus:border-[#C9A14A]/40 transition-colors"
          />
          <button className="bg-[#C9A14A] hover:bg-[#E8C97A] text-[#0A0A0A] text-[10px] sm:text-[11px] font-semibold tracking-[0.14em] uppercase px-4 sm:px-7 py-3 sm:py-3.5 transition-colors whitespace-nowrap">
            Subscribe
          </button>
        </div>
        <p className="text-[10px] sm:text-[11px] text-[#333333] mt-3 tracking-wide">
          No spam. Unsubscribe anytime. 🇦🇪
        </p>
        <p className="text-[10px] sm:text-[11px] text-[#333333] mt-3 tracking-wide">
          Need help?{" "}
          <a href={`mailto:${supportEmail}`} className="text-[#C9A14A] hover:text-[#0A0A0A] transition-colors">
            {supportEmail}
          </a>{" "}
          ·{" "}
          <a
            href={`tel:${supportPhone.replace(/\s+/g, "")}`}
            className="text-[#C9A14A] hover:text-[#0A0A0A] transition-colors"
          >
            {supportPhone}
          </a>
        </p>
      </div>
    </section>
  );
}

// Footer.jsx
export function Footer() {
  const supportEmail = "silverstonetrading2026@gmail.com";
  const supportPhone = "+971 502533578";

  return (
    <footer className="bg-[#f8f9fb] border-t border-[#C9A14A]/20 px-4 sm:px-6 lg:px-12 pt-8 sm:pt-10 lg:pt-12 pb-6 sm:pb-7 lg:pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 mb-8 sm:mb-10 lg:mb-12">
          <div className="col-span-2 lg:col-span-1">
            <img src={zoseLogo} alt="ZOSE logo" className="h-10 sm:h-12 w-auto mb-3 sm:mb-4" />
            <p className="text-[12px] sm:text-[13px] text-[#333333] leading-relaxed max-w-[200px]">
              Premium T-shirts for the UAE lifestyle. Quality crafted, UAE trusted.
            </p>
            <div className="flex gap-2 mt-4 sm:mt-5">
              {["in", "ig", "tw"].map((s) => (
                <div
                  key={s}
                  className="w-7 sm:w-8 h-7 sm:h-8 border border-[#C9A14A]/20 flex items-center justify-center text-[11px] text-[#333333] cursor-pointer hover:border-[#C9A14A]/50 hover:text-[#C9A14A] transition-all"
                >
                  {s}
                </div>
              ))}
            </div>
          </div>

          {[
            { title: "Shop", links: ["New Arrivals", "Bestsellers", "Collections", "Sale"] },
            { title: "Help", links: ["Shipping Info", "Returns", "Size Guide", "Contact Us"] },
            { title: "Contact", links: ["Dubai, UAE", supportEmail, supportPhone] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-[10px] sm:text-[11px] tracking-[0.18em] uppercase text-[#0A0A0A] mb-3 sm:mb-4 lg:mb-5 font-medium">
                {col.title}
              </h4>
              <div className="flex flex-col gap-2 sm:gap-2.5 lg:gap-3">
                {col.links.map((l) => (
                  l === supportEmail ? (
                    <a
                      key={l}
                      href={`mailto:${supportEmail}`}
                      className="text-[11px] sm:text-[12px] lg:text-[13px] text-[#333333] hover:text-[#0A0A0A] transition-colors break-all"
                    >
                      {l}
                    </a>
                  ) : l === supportPhone ? (
                    <a
                      key={l}
                      href={`tel:${supportPhone.replace(/\s+/g, "")}`}
                      className="text-[11px] sm:text-[12px] lg:text-[13px] text-[#333333] hover:text-[#0A0A0A] transition-colors"
                    >
                      {l}
                    </a>
                  ) : (
                    <span key={l} className="text-[11px] sm:text-[12px] lg:text-[13px] text-[#333333] hover:text-[#0A0A0A] cursor-pointer transition-colors">
                      {l}
                    </span>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-[#C9A14A]/20 to-transparent mb-4 sm:mb-5 lg:mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-2 text-center sm:text-left">
          <p className="text-[11px] sm:text-[12px] text-[#333333]">© 2025 Zose. All rights reserved. UAE Licensed.</p>
          <div className="flex gap-4 sm:gap-6">
            {["Privacy", "Terms"].map((l) => (
              <span key={l} className="text-[11px] sm:text-[12px] text-[#333333] hover:text-[#0A0A0A] cursor-pointer transition-colors">
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
