"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";
import Navbar from "../components/Navbar";

export default function BirthdayMoodboard() {
  const [images, setImages] = useState<string[]>([]);
  const [name, setName] = useState("");
  const boardRef = useRef<HTMLDivElement>(null);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [isSharing, setIsSharing] = useState(false);

  /* --------------------------- handlers --------------------------- */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setImages((prev) => [...prev, url]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result as string);
        if (newImages.length === files.length) {
          setImages((prev) => [...prev, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShare = async () => {
    if (images.length === 0) {
      alert("Please add at least one image before sharing");
      return;
    }

    setIsSharing(true);
    try {
      // In a real app, this would upload images to a storage service
      // and create a database entry for the wishboard
      const randomId = Math.random().toString(36).substring(7);
      const url = `${window.location.origin}/view/${randomId}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    } catch (error) {
      console.error("Error sharing:", error);
      alert("Failed to share. Please try again.");
    } finally {
      setIsSharing(false);
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
          Birthday Wishboard
        </h1>

        {/* controls */}
        <div className="w-full max-w-xl flex flex-col gap-4 mb-6">
          {/* name field */}
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-purple-400"
          />

          {/* uploader */}
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-purple-300 rounded-lg p-6 cursor-pointer bg-white hover:bg-purple-50 transition">
            <span className="text-sm text-gray-600">
              Click to select screenshots
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {/* export button */}
          <button
            onClick={exportBoard}
            className="bg-purple-600 text-white rounded-lg py-3 font-semibold hover:bg-purple-700 transition"
          >
            Export board as image
          </button>
        </div>

        {/* board wrapper (captured by html2canvas) */}
        <div
          ref={boardRef}
          className="relative bg-white p-4 rounded-xl shadow-lg"
        >
          {/* birthday date */}
          <div className="flex items-center justify-center mb-4 text-gray-600 px-4">
            <span className="text-2xl font-bold">
              Birthday, {new Date().getFullYear()} Wishboard
            </span>
            <span className="ml-2 text-lg font-bold">🎁</span>
            <span className="ml-2 text-2xl font-bold">🎁</span>
            <span className="ml-2 text-lg font-bold">🎁</span>
          </div>

          {/* image grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-4xl">
            {images.map((src, idx) => (
              <div
                key={idx}
                className="relative w-full aspect-video bg-gray-100 overflow-hidden rounded-xl shadow-md"
              >
                <img
                  src={src}
                  alt={`wish-${idx}`}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>

          {/* signature */}
          {name && (
            <span className="block text-right text-gray-600 text-sm mt-4">
              — {name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
