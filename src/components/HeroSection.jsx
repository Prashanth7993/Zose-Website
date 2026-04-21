import { useEffect, useState } from "react";
import picture1 from "../assets/picture1.png";
import picture2 from "../assets/picture2.png";
import picture3 from "../assets/picture3.png";
import picture4 from "../assets/picture4.png";
import picture5 from "../assets/picture5.png";

export default function HeroSection({ onShopClick }) {
  const heroShowcaseImages = [picture1, picture2, picture3, picture4, picture5];
  const [activeShowcaseImage, setActiveShowcaseImage] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveShowcaseImage((current) => (current + 1) % heroShowcaseImages.length);
    }, 2800);
    return () => window.clearInterval(timer);
  }, [heroShowcaseImages.length]);

  return (
    <section
      className="min-h-[90vh] lg:min-h-[100vh] flex flex-col lg:flex-row items-center relative overflow-hidden px-4 sm:px-6 lg:px-12 pt-20 lg:pt-0"
      style={{
        backgroundImage:
          "repeating-linear-gradient(45deg,rgba(201,161,74,.04) 0,rgba(201,161,74,.04) 1px,transparent 0,transparent 50%)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="absolute inset-0 z-0 bg-white/70" />

      {/* Right background panel - hide on mobile/tablet */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-br from-[#f3f6fb]/90 to-[#ffffff]/90 hidden lg:block"
        style={{ clipPath: "polygon(12% 0,100% 0,100% 100%,0% 100%)" }}
      />

      {/* Desktop showcase on right side */}
      <div className="hidden lg:block absolute right-[8%] top-1/2 -translate-y-1/2 w-[340px] h-[440px] border border-[#C9A14A]/20 bg-[#ffffff]/95 overflow-hidden z-10">
        {heroShowcaseImages.map((imageSrc, index) => (
          <img
            key={`desktop-${imageSrc}`}
            src={imageSrc}
            alt={`Hero showcase ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              activeShowcaseImage === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {heroShowcaseImages.map((_, index) => (
            <span
              key={`hero-dot-desktop-${index}`}
              className={`w-2 h-2 rounded-full ${activeShowcaseImage === index ? "bg-[#C9A14A]" : "bg-white/60"}`}
            />
          ))}
        </div>
      </div>
      

      {/* Top centered badge */}
      <div className="absolute top-0 left-0 right-0 flex justify-center pt-6 sm:pt-8 lg:pt-12 w-full z-10" style={{ animation: "fadeUp .8s cubic-bezier(.22,.61,.36,1) both" }}>
        <div className="flex flex-col items-center gap-2 sm:gap-3 lg:gap-4 px-4">
          <div className="w-12 sm:w-14 lg:w-16 h-px bg-gradient-to-r from-transparent via-[#C9A14A] to-transparent" />
          <span 
            className="text-[12px] sm:text-[14px] lg:text-[16px] tracking-[0.18em] uppercase text-[#C9A14A] font-medium text-center"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            UAE Trusted Brand · Est. 2024
          </span>
          <div className="w-12 sm:w-14 lg:w-16 h-px bg-gradient-to-r from-transparent via-[#C9A14A] to-transparent" />
        </div>
      </div>

      {/* Main content - responsive positioning */}
      <div 
        className="relative w-full max-w-xl lg:max-w-2xl mt-10 sm:mt-12 lg:mt-32 px-4 sm:px-0 lg:ml-12 xl:ml-20" 
        style={{ animation: "fadeUp .8s cubic-bezier(.22,.61,.36,1) both" }}
      >
        {/* Headline */}
        <h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light leading-tight lg:leading-[1.02] text-[#0A0A0A]"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Wear the <em className="text-[#C9A14A]">Spirit</em>
          <br className="hidden sm:block" />
          of the UAE
        </h1>

        {/* Sub-text */}
        <p className="text-sm sm:text-base lg:text-[15px] text-[#333333] leading-relaxed mt-5 sm:mt-6 lg:mt-7 mb-6 sm:mb-8 lg:mb-10 max-w-xs sm:max-w-sm font-light">
          Premium T-shirts crafted for the modern UAE lifestyle. Bold designs,
          exceptional fabrics, delivered across all emirates.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-wrap">
          <button
            onClick={onShopClick}
            className="w-full sm:w-auto bg-[#C9A14A] hover:bg-[#E8C97A] text-[#0A0A0A] text-[10px] sm:text-[11px] font-semibold tracking-[0.16em] uppercase px-6 sm:px-9 py-3 sm:py-3.5 rounded-full transition-colors duration-200"
          >
            Shop Collection
          </button>
          <button className="w-full sm:w-auto border border-[#0A0A0A]/20 hover:border-[#C9A14A] hover:text-[#C9A14A] text-[#0A0A0A] text-[10px] sm:text-[11px] font-medium tracking-[0.14em] uppercase px-6 sm:px-9 py-3 sm:py-3.5 rounded-full transition-all duration-200">
            Explore Lookbook
          </button>
        </div>

        {/* Mobile/tablet showcase under Explore Lookbook */}
        <div className="relative lg:hidden w-full max-w-[420px] aspect-[3/4] mt-6 sm:mt-7 border border-[#C9A14A]/20 bg-[#ffffff]/95 overflow-hidden">
          {heroShowcaseImages.map((imageSrc, index) => (
            <img
              key={`mobile-${imageSrc}`}
              src={imageSrc}
              alt={`Hero showcase ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                activeShowcaseImage === index ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {heroShowcaseImages.map((_, index) => (
              <span
                key={`hero-dot-mobile-${index}`}
                className={`w-2 h-2 rounded-full ${activeShowcaseImage === index ? "bg-[#C9A14A]" : "bg-white/60"}`}
              />
            ))}
          </div>
        </div>

        {/* Stats - responsive grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-8 sm:mt-10 lg:mt-14 pt-6 sm:pt-7 lg:pt-8 border-t border-[#C9A14A]/10">
          {[
            { num: "2K+", label: "Happy Customers" },
            { num: "7", label: "Emirates Served" },
            { num: "50+", label: "Designs" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-start">
              <p
                className="text-lg sm:text-xl lg:text-[22px] font-semibold text-[#C9A14A]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {stat.num}
              </p>
              <p className="text-[10px] sm:text-[11px] tracking-[0.1em] uppercase text-[#333333] mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
