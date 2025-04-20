"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="w-full border-b border-black bg-transparent absolute top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-center gap-8">
        <Link
          href="/"
          className={`text-xl text-black hover:opacity-70 transition-opacity ${
            pathname === "/" ? "border-b-2 border-black" : ""
          }`}
        >
          Home
        </Link>
        <Link
          href="/memories"
          className={`text-xl text-black hover:opacity-70 transition-opacity ${
            pathname === "/memories/" ? "border-b-2 border-black" : ""
          }`}
        >
          Memories
        </Link>
      </div>
    </nav>
  );
}
