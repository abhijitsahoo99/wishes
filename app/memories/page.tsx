"use client";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function BirthdayMoodboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [images, setImages] = useState<string[]>([]);
  const [name, setName] = useState("");
  const boardRef = useRef<HTMLDivElement>(null);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [isSharing, setIsSharing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<
    { id: string; url: string }[]
  >([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && editId) {
      fetchWishboard(editId);
    }
  }, [status, router, editId]);

  const fetchWishboard = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/wishboards/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch wishboard");
      }

      const data = await response.json();
      setName(data.name || "");
      setImages(data.images.map((img: any) => img.url));
      setUploadedImages(
        data.images.map((img: any) => ({ id: img.id, url: img.url }))
      );
      setIsEditing(true);
    } catch (err) {
      console.error("Error fetching wishboard:", err);
      alert("Failed to load wishboard. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /* --------------------------- handlers --------------------------- */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setIsLoading(true);

    try {
      for (const file of files) {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append("file", file);

        // Upload file to the server
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload image");
        }

        const data = await response.json();
        setUploadedImages((prev) => [...prev, { id: data.id, url: data.url }]);
        setImages((prev) => [...prev, data.url]);
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Failed to upload images. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (uploadedImages.length === 0) {
      alert("Please add at least one image before sharing");
      return;
    }

    setIsSharing(true);
    try {
      // Save or update the wishboard to the database
      setIsSaving(true);
      const url = isEditing ? `/api/wishboards/${editId}` : "/api/wishboards";

      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name || "Birthday Wishboard",
          images: uploadedImages.map((img) => ({
            url: img.url,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save wishboard");
      }

      const data = await response.json();
      const wishboardId = isEditing ? editId : data.id;

      // Generate the share URL
      const shareUrl = `${window.location.origin}/view/${wishboardId}`;
      setShareUrl(shareUrl);
      await navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    } catch (error) {
      console.error("Error sharing:", error);
      alert("Failed to share. Please try again.");
    } finally {
      setIsSharing(false);
      setIsSaving(false);
    }
  };

  // Dynamically import html2canvas so it never touches the server bundle
  const exportBoard = async () => {
    if (!boardRef.current) return;

    const html2canvas = (await import("html2canvas")).default;

    const canvas = await html2canvas(boardRef.current, {
      backgroundColor: "#ffffff", // solid background for clean export
      useCORS: true,
      allowTaint: true,
    });

    // PreferBlob for better memory usage
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name || "birthday_moodboard"}.png`;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prevImages) =>
      prevImages.filter((_, index) => index !== indexToRemove)
    );
    setUploadedImages((prevImages) =>
      prevImages.filter((_, index) => index !== indexToRemove)
    );
  };

  /* ----------------------------- view ----------------------------- */
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col items-center py-12 px-4"
      style={{
        backgroundImage: `url('/wishes2.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="w-full min-h-screen backdrop-blur-sm flex flex-col items-center py-12 px-4">
        {/* header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          {isEditing ? "Edit Wishboard" : "Birthday Wishboard"}
        </h1>
        {/* controls */}
        <div className="w-full max-w-xl flex flex-col gap-4 mb-6">
          {/* name field */}
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-purple-400 text-black"
          />

          {/* uploader */}
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-purple-300 rounded-lg p-6 cursor-pointer bg-white hover:bg-purple-50 transition">
            <span className="text-sm text-gray-600">
              {isLoading ? "Uploading..." : "Click to select screenshots"}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={isLoading}
            />
          </label>

          {/* buttons */}
          <div className="flex gap-4">
            <button
              onClick={exportBoard}
              className="flex-1 bg-purple-600 text-white rounded-lg py-3 font-semibold hover:bg-purple-700 transition"
            >
              Export board as image
            </button>
            <button
              onClick={handleShare}
              disabled={isSharing || isSaving || uploadedImages.length === 0}
              className="flex-1 bg-purple-600 text-white rounded-lg py-3 font-semibold hover:bg-purple-700 transition disabled:opacity-50"
            >
              {isSharing || isSaving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
              ) : isEditing ? (
                "Update board"
              ) : (
                "Share board"
              )}
            </button>
          </div>
        </div>

        {/* board wrapper (captured by html2canvas) */}
        <div
          ref={boardRef}
          className="relative bg-white p-6 rounded-xl shadow-lg w-full max-w-5xl"
        >
          {/* birthday date */}
          <div className="flex items-center justify-center mb-6 text-gray-600 px-4">
            <span className="text-3xl font-bold">
              Birthday, {new Date().getFullYear()} Wishboard
            </span>
            <span className="ml-2 text-2xl font-bold">🎁</span>
            <span className="ml-2 text-3xl font-bold">🎁</span>
            <span className="ml-2 text-2xl font-bold">🎁</span>
          </div>

          {/* image grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
            {images.map((src, idx) => (
              <div
                key={idx}
                className="relative w-full aspect-video bg-gray-100 overflow-hidden rounded-xl shadow-md group"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src={src}
                    alt={`wish-${idx}`}
                    fill
                    className="object-contain p-1"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                </div>
                <button
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 z-10"
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* signature */}
          {name && (
            <span className="block text-right text-gray-600 text-lg mt-6">
              — {name}
            </span>
          )}
        </div>

        {/* share URL */}
        {shareUrl && (
          <div className="mt-8 p-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-md w-full max-w-xl">
            <p className="text-sm text-gray-600 mb-2">
              Share this link with others:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 p-2 border rounded text-sm text-gray-700"
              />
              <button
                onClick={() => navigator.clipboard.writeText(shareUrl)}
                className="bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700 transition"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
