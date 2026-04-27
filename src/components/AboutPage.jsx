import { useEffect, useRef } from "react";
/* global IntersectionObserver */

const stats = [
  { number: "50+", label: "Unique Designs" },
  { number: "2024", label: "Established in UAE" },
  { number: "1000+", label: "Happy Customers" },
  { number: "24hr", label: "Fast Delivery" },
];

const values = [
  {
    icon: "✦",
    title: "Premium Quality",
    desc: "Every ZOSE t-shirt is crafted from 100% premium cotton with 240 GSM fabric, ensuring lasting comfort and durability.",
  },
  {
    icon: "⚡",
    title: "UAE Made",
    desc: "Designed specifically for the UAE climate and lifestyle. Our products are made with the desert heat in mind.",
  },
  {
    icon: "↩",
    title: "Easy Returns",
    desc: "We stand behind our products with a hassle-free 14-day return policy. Your satisfaction is our priority.",
  },
];

export default function AboutPage() {
  const sectionRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll(".animate-on-scroll");
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sectionRef} className="bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0A0A0A] via-[#1a1506] to-[#0A0A0A]">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, rgba(201,161,74,0.1) 0, rgba(201,161,74,0.1) 1px, transparent 0, transparent 50%)`,
            backgroundSize: "32px 32px",
          }} />
        </div>
        <div className="relative text-center px-4 sm:px-6 py-20 max-w-4xl mx-auto">
          <p className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#C9A14A] mb-4 animate-on-scroll opacity-0 translate-y-4 transition-all duration-700">
            Our Story
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl text-white mb-6 animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 delay-100" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            About ZOSE
          </h1>
          <p className="text-[15px] sm:text-[17px] lg:text-[18px] text-white/70 leading-relaxed max-w-2xl mx-auto animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 delay-200">
            Born in the UAE, crafted for the modern individual who values quality, comfort, and distinctive style.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Mission Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="animate-on-scroll opacity-0 translate-y-4 transition-all duration-700">
            <p className="text-[10px] sm:text-[11px] tracking-[0.22em] uppercase text-[#C9A14A] mb-3">Our Mission</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl text-[#0A0A0A] mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Redefining Premium<br />Streetwear in UAE
            </h2>
            <p className="text-[14px] sm:text-[16px] text-[#333333] leading-relaxed mb-6">
              ZOSE was founded with a simple mission: to create premium t-shirts that perfectly balance luxury and comfort.
              Based in Dubai, we understand the unique needs of the UAE lifestyle.
            </p>
            <p className="text-[14px] sm:text-[16px] text-[#333333] leading-relaxed">
              Every piece in our collection undergoes rigorous quality testing, ensuring that each t-shirt not only looks exceptional
              but also withstands the test of time. We source only the finest honeycomb cotton fabric, ensuring breathability and
              durability that UAE customers deserve.
            </p>
          </div>
          <div className="relative animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 delay-200">
            <div className="bg-gradient-to-br from-[#f8f9fb] to-[#f0efe8] rounded-3xl p-8 sm:p-10 border border-[#C9A14A]/20">
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <div key={stat.label} className="text-center animate-on-scroll opacity-0 translate-y-4 transition-all duration-700" style={{ animationDelay: `${index * 100}ms` }}>
                    <p className="text-3xl sm:text-4xl lg:text-[42px] font-semibold text-[#C9A14A] mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {stat.number}
                    </p>
                    <p className="text-[11px] sm:text-[12px] tracking-[0.14em] uppercase text-[#555555]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -top-3 -right-3 w-16 h-16 border-t-2 border-r-2 border-[#C9A14A]/30 rounded-tr-3xl" />
            <div className="absolute -bottom-3 -left-3 w-16 h-16 border-b-2 border-l-2 border-[#C9A14A]/30 rounded-bl-3xl" />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-12 bg-[#f8f9fb]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-14 lg:mb-16 animate-on-scroll opacity-0 translate-y-4 transition-all duration-700">
            <p className="text-[10px] sm:text-[11px] tracking-[0.22em] uppercase text-[#C9A14A] mb-3">What We Stand For</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl text-[#0A0A0A]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Our Values
            </h2>
            <div className="w-12 h-px mx-auto mt-4 bg-gradient-to-r from-transparent via-[#C9A14A] to-transparent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {values.map((value, index) => (
              <div
                key={value.title}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C9A14A]/20 hover:border-[#C9A14A]/40 hover:-translate-y-1 transition-all duration-300 animate-on-scroll opacity-0 translate-y-4"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-[#C9A14A]/10 flex items-center justify-center text-2xl mb-5">
                  {value.icon}
                </div>
                <h3 className="text-lg sm:text-xl text-[#0A0A0A] mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {value.title}
                </h3>
                <p className="text-[13px] sm:text-[14px] text-[#555555] leading-relaxed">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto text-center animate-on-scroll opacity-0 translate-y-4 transition-all duration-700">
          <p className="text-[10px] sm:text-[11px] tracking-[0.22em] uppercase text-[#C9A14A] mb-3">The ZOSE Promise</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl text-[#0A0A0A] mb-8" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Quality You Can Trust
          </h2>
          <p className="text-[14px] sm:text-[16px] text-[#333333] leading-relaxed mb-6">
            From the moment you unbox your ZOSE t-shirt, you&apos;ll notice the difference. Our premium honeycomb cotton fabric
            provides an unparalleled wearing experience – soft against the skin, yet sturdy enough to maintain its shape
            wash after wash.
          </p>
          <p className="text-[14px] sm:text-[16px] text-[#333333] leading-relaxed">
            Every stitch, every seam, and every detail is scrutinized to ensure it meets our exacting standards. This is not
            just fashion – it&apos;s a statement of quality consciousness and refined taste.
          </p>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-12 bg-[#0A0A0A]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl text-white mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Get in Touch
          </h2>
          <p className="text-[14px] sm:text-[16px] text-white/70 mb-8">
            Have questions? We&apos;d love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:silverstonetrading2026@gmail.com"
              className="bg-[#C9A14A] hover:bg-[#E8C97A] text-[#0A0A0A] text-[11px] font-semibold tracking-[0.14em] uppercase px-8 py-3.5 rounded-full transition-colors"
            >
              Email Us
            </a>
            <a
              href="tel:+971502533578"
              className="border border-white/30 hover:border-white/60 text-white text-[11px] font-semibold tracking-[0.14em] uppercase px-8 py-3.5 rounded-full transition-colors"
            >
              Call Us
            </a>
          </div>
        </div>
      </section>

      <style>{`
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(16px);
        }
        .animate-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </div>
  );
}