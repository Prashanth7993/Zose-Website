import { useEffect, useMemo, useState } from "react";
import dubai1 from "../assets/dubai1.png";
import dubai2 from "../assets/dubai2.png";
import duabi3 from "../assets/duabi3.png";
import dubai4 from "../assets/dubai4.png";
import dubai5 from "../assets/dubai5.png";
import dubaiReel from "../assets/dubai-reel.mp4";

export default function DubaiShowcaseSection() {
  const mediaItems = useMemo(
    () => [
      {
        type: "slide",
        title: "Downtown Night Style",
        subtitle: "Modern streetwear inspired by Dubai lights.",
        src: dubai1,
      },
      {
        type: "slide",
        title: "Desert Gold Edit",
        subtitle: "Minimal cuts with warm UAE tones.",
        src: dubai2,
      },
      {
        type: "video",
        title: "Dubai Styling Reel",
        subtitle: "Motion campaign showcase.",
        src: dubaiReel,
      },
      {
        type: "slide",
        title: "City Luxe Drop",
        subtitle: "Clean lines and premium comfort for everyday wear.",
        src: duabi3,
      },
      {
        type: "slide",
        title: "Urban Night Edit",
        subtitle: "Bold silhouettes inspired by downtown energy.",
        src: dubai4,
      },
      {
        type: "slide",
        title: "Golden Hour Collection",
        subtitle: "Refined essentials in warm, modern tones.",
        src: dubai5,
      },
    ],
    []
  );

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % mediaItems.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [mediaItems.length]);

  const activeItem = mediaItems[activeIndex];

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-[#C9A14A] mb-2">Dubai Styling</p>
          <h2
            className="text-2xl sm:text-3xl lg:text-[40px] font-semibold text-[#0A0A0A]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Visual Showcase
          </h2>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-[#C9A14A]/30 bg-white shadow-lg shadow-black/5">
          <div className="aspect-[16/9]">
            {activeItem.type === "video" ? (
              <video className="w-full h-full object-cover" src={activeItem.src} autoPlay muted loop playsInline />
            ) : (
              <div className="w-full h-full flex items-end p-6 sm:p-8 lg:p-10 transition-all duration-500">
                <img src={activeItem.src} alt={activeItem.title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="bg-white/85 backdrop-blur-sm rounded-xl p-4 sm:p-5 max-w-md border border-[#C9A14A]/20">
                  <h3 className="text-lg sm:text-xl font-semibold text-[#0A0A0A] mb-1">{activeItem.title}</h3>
                  <p className="text-[12px] sm:text-[13px] text-[#333333]">{activeItem.subtitle}</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveIndex((activeIndex - 1 + mediaItems.length) % mediaItems.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-[#C9A14A]/30 text-[#0A0A0A]"
            aria-label="Previous slide"
          >
            {"<"}
          </button>
          <button
            onClick={() => setActiveIndex((activeIndex + 1) % mediaItems.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-[#C9A14A]/30 text-[#0A0A0A]"
            aria-label="Next slide"
          >
            {">"}
          </button>
        </div>
      </div>
    </section>
  );
}
