import { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

// Define types for our data
type Image = {
  id: string;
  url: string;
  createdAt: Date;
  wishboardId: string;
};

type Wishboard = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  images: Image[];
};

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const wishboard = await getWishboard(params.id);

  if (!wishboard) {
    return {
      title: "Wishboard Not Found",
      description: "The requested wishboard could not be found.",
    };
  }

  return {
    title: `${wishboard.name} - Birthday Wishboard`,
    description: `View ${wishboard.name}'s birthday wishboard with ${wishboard.images.length} images.`,
    openGraph: {
      title: `${wishboard.name} - Birthday Wishboard`,
      description: `View ${wishboard.name}'s birthday wishboard with ${wishboard.images.length} images.`,
      images: wishboard.images.map((image: Image) => ({
        url: image.url,
        width: 1200,
        height: 630,
        alt: wishboard.name,
      })),
      type: "website",
      siteName: "Birthday Wishboard",
    },
    twitter: {
      card: "summary_large_image",
      title: `${wishboard.name} - Birthday Wishboard`,
      description: `View ${wishboard.name}'s birthday wishboard with ${wishboard.images.length} images.`,
      images: wishboard.images.map((image: Image) => image.url),
    },
  };
}

// Fetch wishboard data
async function getWishboard(id: string): Promise<Wishboard | null> {
  try {
    const wishboard = await prisma.wishboard.findUnique({
      where: { id },
      include: { images: true },
    });
    return wishboard;
  } catch (error) {
    console.error("Error fetching wishboard:", error);
    return null;
  }
}

export default async function ViewWishboard({
  params,
}: {
  params: { id: string };
}) {
  const wishboard = await getWishboard(params.id);
  const currentYear = new Date().getFullYear();

  if (!wishboard) {
    notFound();
  }

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
          {wishboard.name}
        </h1>

        {/* board wrapper */}
        <div className="relative bg-white p-4 rounded-xl shadow-lg w-full max-w-4xl">
          {/* birthday date */}
          <div className="flex items-center justify-center mb-4 text-gray-600 px-4">
            <span className="text-2xl font-bold">
              Birthday, {currentYear} Wishboard
            </span>
            <span className="ml-2 text-lg font-bold">🎁</span>
            <span className="ml-2 text-2xl font-bold">🎁</span>
            <span className="ml-2 text-lg font-bold">🎁</span>
          </div>

          {/* image grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
            {wishboard.images.map((image: Image, idx: number) => (
              <div
                key={image.id}
                className="relative w-full aspect-video bg-gray-100 overflow-hidden rounded-xl shadow-md"
              >
                <img
                  src={image.url}
                  alt={`wish-${idx}`}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* footer */}
        <div className="mt-8 text-center text-gray-600">
          <p>Created with ❤️ using Birthday Wishboard</p>
        </div>
      </div>
    </div>
  );
}
