import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wishboards = await prisma.wishboard.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        images: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(wishboards);
  } catch (error) {
    console.error("Error fetching wishboards:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishboards" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, images } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Create the wishboard
    const wishboard = await prisma.wishboard.create({
      data: {
        name,
        userId: session.user.id,
      },
      include: {
        images: true,
      },
    });

    // If images are provided, create them
    if (images && Array.isArray(images) && images.length > 0) {
      await prisma.image.createMany({
        data: images.map((image: { url: string; alt: string }) => ({
          url: image.url,
          alt: image.alt,
          wishboardId: wishboard.id,
        })),
      });

      // Fetch the wishboard with images
      const wishboardWithImages = await prisma.wishboard.findUnique({
        where: {
          id: wishboard.id,
        },
        include: {
          images: true,
        },
      });

      return NextResponse.json(wishboardWithImages);
    }

    return NextResponse.json(wishboard);
  } catch (error) {
    console.error("Error creating wishboard:", error);
    return NextResponse.json(
      { error: "Failed to create wishboard" },
      { status: 500 }
    );
  }
}
