import { Sparkles, Star } from "lucide-react";

export function FloatingDecorations() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <Sparkles className="floating-star absolute left-[7%] top-[14%] h-5 w-5 text-[#D7AC64]" strokeWidth={1.4} />
      <Star className="floating-star floating-star--slow absolute right-[9%] top-[22%] h-4 w-4 fill-[#F6CE4B] text-[#F6CE4B]" strokeWidth={1.2} />
      <span className="floating-star floating-star--fast absolute left-[12%] top-[64%] h-3 w-3 rounded-full bg-[#A9DDF1]" />
      <span className="floating-star floating-star--slow absolute bottom-[18%] right-[14%] h-4 w-4 rotate-45 bg-[#F6CE4B]" />
      <span className="absolute left-[5%] top-[38%] h-12 w-12 rounded-full border border-[#A9DDF1]/70" />
      <span className="absolute bottom-[10%] right-[5%] h-20 w-20 rounded-full border border-[#D7AC64]/30" />
    </div>
  );
}
