import zoseLogo from "../assets/zose.jpeg";

export default function FloatingContactButtons() {
  const supportEmail = "silverstonetrading2026@gmail.com";
  const supportPhone = "+971 502533578";
  const whatsappNumber = "971502533578";
  const whatsappMessage = encodeURIComponent("Hello ZOSE, 'Own your style'.");

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col gap-2 sm:gap-3">
      <a
        href={`mailto:${supportEmail}`}
        className="group flex items-center gap-2 sm:gap-3 bg-white border border-[#C9A14A]/30 hover:border-[#C9A14A] px-3 sm:px-4 py-2.5 rounded-full shadow-lg shadow-black/15 transition-all"
        aria-label="Email support"
      >
        <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#C9A14A]/20 overflow-hidden border border-[#C9A14A]/40">
          <img src={zoseLogo} alt="ZOSE logo" className="w-full h-full object-cover" />
        </span>
        <span className="text-[10px] sm:text-[11px] tracking-[0.12em] uppercase text-[#0A0A0A]">Email</span>
      </a>

      <a
        href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
        target="_blank"
        rel="noreferrer"
        className="group flex items-center gap-2 sm:gap-3 bg-white border border-[#C9A14A]/30 hover:border-[#C9A14A] px-3 sm:px-4 py-2.5 rounded-full shadow-lg shadow-black/15 transition-all"
        aria-label={`Chat on WhatsApp at ${supportPhone}`}
      >
        <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#C9A14A]/20 text-[#C9A14A] flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" aria-hidden="true">
            <path d="M20.52 3.48A11.8 11.8 0 0 0 12.08 0C5.57 0 .3 5.27.3 11.78c0 2.08.54 4.1 1.58 5.89L0 24l6.52-1.85a11.72 11.72 0 0 0 5.56 1.42h.01c6.5 0 11.78-5.27 11.78-11.78 0-3.15-1.23-6.1-3.35-8.31Zm-8.44 18.1h-.01a9.7 9.7 0 0 1-4.95-1.36l-.35-.21-3.87 1.1 1.04-3.78-.23-.38a9.75 9.75 0 0 1-1.5-5.17c0-5.4 4.39-9.79 9.8-9.79a9.73 9.73 0 0 1 6.93 2.88 9.7 9.7 0 0 1 2.86 6.91c0 5.4-4.4 9.8-9.72 9.8Zm5.37-7.35c-.3-.15-1.75-.86-2.02-.95-.27-.1-.47-.15-.66.15-.2.3-.77.95-.94 1.14-.17.2-.35.22-.64.08-.3-.15-1.25-.46-2.38-1.47a8.87 8.87 0 0 1-1.65-2.05c-.17-.3-.02-.45.13-.6.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.52-.08-.15-.66-1.58-.9-2.17-.24-.57-.48-.5-.66-.5h-.56c-.2 0-.52.08-.8.38-.27.3-1.04 1.01-1.04 2.46 0 1.45 1.07 2.85 1.22 3.05.15.2 2.08 3.17 5.03 4.45.7.3 1.25.48 1.67.61.7.23 1.33.2 1.84.12.56-.08 1.75-.72 2-.14.25-.43.25-.8.17-.88-.08-.08-.27-.13-.57-.28Z" />
          </svg>
        </span>
        <span className="text-[10px] sm:text-[11px] tracking-[0.12em] uppercase text-[#0A0A0A]">WhatsApp</span>
      </a>
    </div>
  );
}
