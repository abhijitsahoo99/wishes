"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <nav className="w-full border-b border-black bg-transparent absolute top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className={`text-xl text-black hover:opacity-70 transition-opacity ${
              pathname === "/" ? "border-b-2 border-black" : ""
            }`}
          >
            home
          </Link>
          {session && (
            <Link
              href="/memories"
              className={`text-xl text-black hover:opacity-70 transition-opacity ${
                pathname === "/memories" ? "border-b-2 border-black" : ""
              }`}
            >
              memories
            </Link>
          )}
        </div>

        <div>
          {status === "loading" ? (
            <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          ) : session ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {session.user?.image ? (
                  <div className="relative w-8 h-8">
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      fill
                      className="rounded-full object-cover"
                      sizes="32px"
                    />
                  </div>
                ) : (
                  <div className="text-xl text-black w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white">
                    {session.user?.name?.[0] || "U"}
                  </div>
                )}
                <span className="text-black">{session.user?.name}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-xl text-black hover:opacity-70 transition-opacity"
              >
                sign out
              </button>
            </div>
          ) : (
            pathname !== "/auth/signin" && (
              <Link
                href="/auth/signin"
                className="text-xl text-black hover:opacity-70 transition-opacity"
              >
                sign in
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
