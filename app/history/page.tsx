"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Wishboard {
  id: string;
  name: string;
  createdAt: string;
  images: {
    id: string;
    url: string;
  }[];
}

export default function History() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [wishboards, setWishboards] = useState<Wishboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchWishboards();
    }
  }, [status, router]);

  const fetchWishboards = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/wishboards");

      if (!response.ok) {
        throw new Error("Failed to fetch wishboards");
      }

      const data = await response.json();
      setWishboards(data);
    } catch (err) {
      console.error("Error fetching wishboards:", err);
      setError("Failed to load your wishboards. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this wishboard?")) {
      return;
    }

    try {
      const response = await fetch(`/api/wishboards/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete wishboard");
      }

      // Remove the deleted wishboard from state
      setWishboards(wishboards.filter((wishboard) => wishboard.id !== id));
    } catch (err) {
      console.error("Error deleting wishboard:", err);
      alert("Failed to delete wishboard. Please try again.");
    }
  };

  const handleCopyLink = async (id: string) => {
    try {
      const shareUrl = `${window.location.origin}/view/${id}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopiedId(id);

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (err) {
      console.error("Error copying link:", err);
      alert("Failed to copy link. Please try again.");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div
        className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center"
        style={{
          backgroundImage: `url('/wishes2.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center p-4"
        style={{
          backgroundImage: `url('/wishes2.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchWishboards}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col items-center pt-32 pb-12 px-4"
      style={{
        backgroundImage: `url('/wishes2.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="w-full max-w-4xl backdrop-blur-sm bg-white/80 p-8 rounded-lg shadow-md mt-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Your Wishboards
        </h1>

        {wishboards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-6 text-lg">
              You haven't created any wishboards yet.
            </p>
            <Link
              href="/memories"
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700 transition"
            >
              Create Your First Wishboard
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {wishboards.map((wishboard) => (
              <div
                key={wishboard.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {wishboard.name}
                    </h2>
                    <button
                      onClick={() => handleCopyLink(wishboard.id)}
                      className="text-gray-500 hover:text-purple-600 transition"
                      title="Copy share link"
                    >
                      {copiedId === wishboard.id ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    Created on{" "}
                    {new Date(wishboard.createdAt).toLocaleDateString()}
                  </p>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {wishboard.images.slice(0, 3).map((image) => (
                      <div key={image.id} className="relative aspect-square">
                        <Image
                          src={image.url}
                          alt="Wishboard image"
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    ))}
                    {wishboard.images.length > 3 && (
                      <div className="relative aspect-square bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-gray-500">
                          +{wishboard.images.length - 3}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <Link
                      href={`/view/${wishboard.id}`}
                      className="text-purple-600 hover:text-purple-800 transition"
                    >
                      View
                    </Link>
                    <Link
                      href={`/memories?edit=${wishboard.id}`}
                      className="text-blue-600 hover:text-blue-800 transition mr-4"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(wishboard.id)}
                      className="text-red-600 hover:text-red-800 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
