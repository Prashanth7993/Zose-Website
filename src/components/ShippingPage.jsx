import { useEffect } from "react";

const shippingSteps = [
  {
    step: "01",
    title: "Order Confirmation",
    desc: "Once you place your order, you'll receive a WhatsApp confirmation with order details and estimated delivery timeline.",
  },
  {
    step: "02",
    title: "Processing",
    desc: "Your order is carefully prepared and packaged. Orders are processed within 1-2 business days.",
  },
  {
    step: "03",
    title: "Dispatch",
    desc: "Your package is dispatched via our trusted delivery partners. You'll receive tracking information via WhatsApp.",
  },
  {
    step: "04",
    title: "Delivery",
    desc: "Express delivery to all 7 emirates within 2-3 working days. Same-day delivery available in Dubai.",
  },
];

const deliveryInfo = [
  { icon: "📦", title: "All Emirates", desc: "We deliver to all 7 emirates: Dubai, Abu Dhabi, Sharjah, Ajman, Fujairah, Ras Al Khaimah, and Umm Al Quwain." },
  { icon: "⚡", title: "Express 24-48h", desc: "Standard express delivery within 24-48 working hours across the UAE." },
  { icon: "🚚", title: "Free Shipping", desc: "Free shipping on all orders above AED 199. Standard shipping AED 15 for orders below AED 199." },
  { icon: "📍", title: "Same Day in Dubai", desc: "Same-day delivery available for orders placed before 2 PM in Dubai." },
];

export default function ShippingPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-12 bg-gradient-to-br from-[#f8f9fb] to-[#f0efe8]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#C9A14A] mb-4">Delivery Information</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl text-[#0A0A0A] mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Shipping Info
          </h1>
          <div className="w-12 h-px mx-auto bg-gradient-to-r from-transparent via-[#C9A14A] to-transparent mb-6" />
          <p className="text-[14px] sm:text-[16px] text-[#555555] max-w-2xl mx-auto">
            Fast, reliable delivery across the UAE. We ensure your ZOSE products reach you in perfect condition.
          </p>
        </div>
      </section>

      {/* Delivery Info Cards */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {deliveryInfo.map((info) => (
            <div key={info.title} className="rounded-2xl border border-[#C9A14A]/20 p-5 sm:p-6 hover:border-[#C9A14A]/40 hover:-translate-y-0.5 transition-all duration-300">
              <div className="text-2xl mb-4">{info.icon}</div>
              <h3 className="text-[15px] sm:text-[16px] font-semibold text-[#0A0A0A] mb-2">{info.title}</h3>
              <p className="text-[12px] sm:text-[13px] text-[#555555] leading-relaxed">{info.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 bg-[#f8f9fb]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-12 lg:mb-14">
            <p className="text-[10px] sm:text-[11px] tracking-[0.22em] uppercase text-[#C9A14A] mb-3">How It Works</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl text-[#0A0A0A]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Delivery Process
            </h2>
            <div className="w-12 h-px mx-auto mt-4 bg-gradient-to-r from-transparent via-[#C9A14A] to-transparent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {shippingSteps.map((item, index) => (
              <div key={item.step} className="relative">
                <div className="text-6xl sm:text-7xl font-light text-[#C9A14A]/10 absolute -top-2 -left-1">{item.step}</div>
                <div className="relative pt-8 sm:pt-10">
                  <h3 className="text-[15px] sm:text-[16px] font-semibold text-[#0A0A0A] mb-3">{item.title}</h3>
                  <p className="text-[12px] sm:text-[13px] text-[#555555] leading-relaxed">{item.desc}</p>
                </div>
                {index < shippingSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 -right-4 w-8 border-t border-dashed border-[#C9A14A]/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shipping Rates */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 max-w-4xl mx-auto">
        <div className="rounded-3xl border border-[#C9A14A]/20 overflow-hidden">
          <div className="bg-[#0A0A0A] px-6 sm:px-8 py-4">
            <h3 className="text-[14px] sm:text-[15px] font-semibold tracking-[0.14em] uppercase text-white">Shipping Rates</h3>
          </div>
          <div className="p-6 sm:p-8 space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-[#C9A14A]/10">
              <span className="text-[13px] sm:text-[14px] text-[#333333]">Dubai (Same Day)</span>
              <span className="text-[13px] sm:text-[14px] font-semibold text-[#C9A14A]">AED 25</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[#C9A14A]/10">
              <span className="text-[13px] sm:text-[14px] text-[#333333]">Dubai (Next Day)</span>
              <span className="text-[13px] sm:text-[14px] font-semibold text-[#C9A14A]">AED 15</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[#C9A14A]/10">
              <span className="text-[13px] sm:text-[14px] text-[#333333]">Other Emirates (2-3 Days)</span>
              <span className="text-[13px] sm:text-[14px] font-semibold text-[#C9A14A]">AED 20</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-[13px] sm:text-[14px] text-[#333333]">Orders above AED 199</span>
              <span className="text-[13px] sm:text-[14px] font-semibold text-emerald-600">FREE</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 bg-[#f8f9fb]">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-xl sm:text-2xl text-[#0A0A0A] mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Need Help With Shipping?
          </h3>
          <p className="text-[13px] sm:text-[14px] text-[#555555] mb-6">
            Contact us on WhatsApp for any shipping queries or special delivery requests.
          </p>
          <a
            href="https://wa.me/971502533578?text=Hello ZOSE, I have a question about shipping."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#C9A14A] hover:bg-[#E8C97A] text-[#0A0A0A] text-[11px] font-semibold tracking-[0.14em] uppercase px-8 py-3.5 rounded-full transition-colors"
          >
            Contact on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}