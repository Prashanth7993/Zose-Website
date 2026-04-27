import { useEffect } from "react";

const returnSteps = [
  {
    step: "1",
    title: "Request Return",
    desc: "Contact us via WhatsApp within 14 days of delivery. Provide your order ID and reason for return.",
  },
  {
    step: "2",
    title: "Review & Approval",
    desc: "Our team will review your request and notify you of approval within 24-48 hours.",
  },
  {
    step: "3",
    title: "Return Shipping",
    desc: "Once approved, we'll arrange pickup from your location in Dubai. For other emirates, we'll provide return shipping instructions.",
  },
  {
    step: "4",
    title: "Refund Processed",
    desc: "Upon receiving the returned item, refund will be processed within 5-7 business days to your original payment method.",
  },
];

const conditions = [
  { icon: "✓", text: "Items must be unworn, unwashed, and in original condition with all tags attached" },
  { icon: "✓", text: "Returns must be initiated within 14 days of delivery date" },
  { icon: "✓", text: "Original packaging (poly bag, box) must be included" },
  { icon: "✓", text: "Proof of purchase (order confirmation) must be provided" },
];

const nonReturnable = [
  { icon: "✗", text: "Items that have been worn, washed, altered, or damaged by customer" },
  { icon: "✗", text: "Items returned after 14 days from delivery" },
  { icon: "✗", text: "Sale or clearance items marked as 'Final Sale'" },
  { icon: "✗", text: "Customized or personalized products" },
];

export default function ReturnsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white">
      {/* Video Background Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-white-sand-beach-and-palm-trees-1564-large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative text-center px-4 sm:px-6 py-20 max-w-4xl mx-auto z-10">
          <p className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#C9A14A] mb-4">Hassle-Free</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl text-white mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Returns & Refunds
          </h1>
          <p className="text-[15px] sm:text-[17px] lg:text-[18px] text-white/80 leading-relaxed max-w-2xl mx-auto">
            We want you to love your ZOSE purchase. If you&apos;re not completely satisfied, our return process is simple and straightforward.
          </p>
        </div>
      </section>

      {/* Return Process */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-14 lg:mb-16">
            <p className="text-[10px] sm:text-[11px] tracking-[0.22em] uppercase text-[#C9A14A] mb-3">How It Works</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl text-[#0A0A0A]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Return Process
            </h2>
            <div className="w-12 h-px mx-auto mt-4 bg-gradient-to-r from-transparent via-[#C9A14A] to-transparent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {returnSteps.map((item, index) => (
              <div key={item.step} className="relative bg-[#f8f9fb] rounded-3xl p-6 sm:p-8 border border-[#C9A14A]/15">
                <div className="w-10 h-10 rounded-full bg-[#C9A14A] text-[#0A0A0A] flex items-center justify-center text-[14px] font-bold mb-5">
                  {item.step}
                </div>
                <h3 className="text-[15px] sm:text-[16px] font-semibold text-[#0A0A0A] mb-3">{item.title}</h3>
                <p className="text-[12px] sm:text-[13px] text-[#555555] leading-relaxed">{item.desc}</p>
                {index < returnSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-[#C9A14A]/30">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conditions */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-12 bg-[#f8f9fb]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            {/* Eligible for Return */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C9A14A]/20">
              <h3 className="text-xl sm:text-2xl text-[#0A0A0A] mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Eligible for Return
              </h3>
              <div className="space-y-4">
                {conditions.map((item) => (
                  <div key={item.text} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5">
                      {item.icon}
                    </span>
                    <span className="text-[13px] sm:text-[14px] text-[#333333] leading-relaxed">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Not Eligible */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C9A14A]/20">
              <h3 className="text-xl sm:text-2xl text-[#0A0A0A] mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Not Acceptable
              </h3>
              <div className="space-y-4">
                {nonReturnable.map((item) => (
                  <div key={item.text} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5">
                      {item.icon}
                    </span>
                    <span className="text-[13px] sm:text-[14px] text-[#333333] leading-relaxed">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Terms & Conditions */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-12 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl text-[#0A0A0A]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Terms & Conditions
            </h2>
            <div className="w-12 h-px mx-auto mt-4 bg-gradient-to-r from-transparent via-[#C9A14A] to-transparent" />
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#C9A14A]/15 p-5 sm:p-6">
              <h4 className="text-[14px] sm:text-[15px] font-semibold text-[#0A0A0A] mb-2">Refund Timeline</h4>
              <p className="text-[12px] sm:text-[13px] text-[#555555] leading-relaxed">
                Refunds are processed within 5-7 business days after we receive and inspect the returned item.
                The refund will be credited to your original payment method. You will receive a confirmation notification once the refund has been initiated.
              </p>
            </div>
            <div className="rounded-2xl border border-[#C9A14A]/15 p-5 sm:p-6">
              <h4 className="text-[14px] sm:text-[15px] font-semibold text-[#0A0A0A] mb-2">Shipping Costs</h4>
              <p className="text-[12px] sm:text-[13px] text-[#555555] leading-relaxed">
                Return shipping is free for all orders within Dubai. For orders in other emirates, a nominal shipping fee may apply.
                This fee will be communicated to you before the return is processed.
              </p>
            </div>
            <div className="rounded-2xl border border-[#C9A14A]/15 p-5 sm:p-6">
              <h4 className="text-[14px] sm:text-[15px] font-semibold text-[#0A0A0A] mb-2">Late Returns</h4>
              <p className="text-[12px] sm:text-[13px] text-[#555555] leading-relaxed">
                Returns requested after 14 days from the delivery date will not be accepted. Please ensure you initiate the return request within the specified timeframe.
              </p>
            </div>
            <div className="rounded-2xl border border-[#C9A14A]/15 p-5 sm:p-6">
              <h4 className="text-[14px] sm:text-[15px] font-semibold text-[#0A0A0A] mb-2">Exchange Options</h4>
              <p className="text-[12px] sm:text-[13px] text-[#555555] leading-relaxed">
                If you&apos;d like to exchange your item for a different size or color, please let us know in your return request.
                Subject to availability, we&apos;ll arrange the exchange at no additional cost.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-12 bg-[#0A0A0A]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl text-white mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Start Your Return
          </h2>
          <p className="text-[14px] sm:text-[16px] text-white/70 mb-8">
            Need to return an item? Contact us on WhatsApp and we&apos;ll guide you through the process.
          </p>
          <a
            href="https://wa.me/971502533578?text=Hello ZOSE, I would like to initiate a return."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#C9A14A] hover:bg-[#E8C97A] text-[#0A0A0A] text-[11px] font-semibold tracking-[0.14em] uppercase px-10 py-4 rounded-full transition-colors"
          >
            Request Return on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}