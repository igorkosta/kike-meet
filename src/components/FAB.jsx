import React from "react";
import { Video } from "lucide-react";
import useIsMobile from "../hooks/useIsMobile";

export default function FAB() {
  const isMobile = useIsMobile();

  return (
    <>
      {isMobile && (
        <a
          href="/meet"
          className="
            fixed bottom-6 right-6
            bg-blue-600 text-white
            rounded-full w-16 h-16
            flex items-center justify-center
            shadow-xl
            animate-pulse-fab
            z-50
          "
        >
            <Video className="w-8 h-8" />
        </a>
      )}
    </>
  );
};
