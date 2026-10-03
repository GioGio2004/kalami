import Image from "next/image";
import type { ReactNode } from "react";

/**
 * A real device image (public/phone-frame.png, 432x860 units) laid over live content.
 * The screen is a transparent cutout, so `children` render behind the glass.
 * Screen box in frame units: x 26, y 20, 380 x 820, corner radius 48.
 */
export function PhoneFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative aspect-[432/860] drop-shadow-[0_40px_50px_rgba(20,20,20,0.35)] ${className}`}>
      <div
        className="absolute overflow-hidden bg-card"
        style={{
          left: "6.019%",
          top: "2.326%",
          width: "87.963%",
          height: "95.349%",
          borderRadius: "12.63% / 5.85%",
        }}
      >
        {/* Clears the Dynamic Island, which is part of the image. */}
        <div className="h-full pt-[2.7rem]">{children}</div>
      </div>
      <Image
        src="/phone-frame.png"
        alt=""
        width={432}
        height={860}
        sizes="300px"
        className="pointer-events-none absolute inset-0 size-full select-none"
      />
    </div>
  );
}
