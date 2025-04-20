"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/auth/signin");
  };

  return (
    <main
      className="h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center fixed top-0 left-0"
      style={{
        backgroundImage: `url('/wishes2.jpg')`,
      }}
    >
      <div className="max-w-4xl mx-auto text-center px-4">
        <h1 className="text-black text-5xl font-medium mb-8">
          welcome to wishes
        </h1>
        <p className="text-black text-2xl leading-relaxed text-center mb-8">
          Imagine looking back at every heartfelt message, every quirky meme,
          every thoughtful note—all in one beautifully crafted, dynamic
          timeline. at wishes, each uploaded screenshot is a piece of your
          story, curated into a personal museum of love and celebration that
          grows with you each year.
        </p>

        {/* <button
          onClick={handleGetStarted}
          className="inline-block bg-purple-600 text-white rounded-lg py-3 px-8 font-medium text-xl hover:bg-purple-700 transition"
        >
          Get Started
        </button> */}
      </div>

      {/* footer */}
      <div className="absolute bottom-0 w-full px-4 py-4 border-t border-black text-center text-gray-600 text-xl bg-gradient-to-b from-transparent to-white/90 backdrop-blur-sm">
        built by{" "}
        <a
          href="https://twitter.com/kb24x7"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-600 hover:text-purple-700 underline"
        >
          @kb24x7
        </a>{" "}
        &{" "}
        <a
          href="https://twitter.com/justabhi99"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-600 hover:text-purple-700 underline"
        >
          @justabhi99
        </a>
        . <span className="italic">say hi</span>
      </div>
    </main>
  );
}
