"use client";
import { useEffect } from "react";

export default function InstagramFeed() {
  useEffect(() => {
    if (
      !document.querySelector(
        'script[src="https://elfsightcdn.com/platform.js"]',
      )
    ) {
      const script = document.createElement("script");
      script.src = "https://elfsightcdn.com/platform.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <>
    <div className="relative ">

      <div
        className="elfsight-app-9c21b50e-953a-4909-b745-7d5bf194ccbe"
                    style={{ fontFamily: "fairplaybold" }}

        data-elfsight-app-lazy
        />

      <div className="absolute bottom-2 bg-white h-10 w-full"></div>
        </div>
    </>
  );
}
