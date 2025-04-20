import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../../lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, images } = await request.json();

    if (!name || !images || !Array.isArray(images)) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Create the wishboard
    const wishboard = await prisma.wishboard.create({
      data: {
        name,
        userId: session.user.id,
      },
    });

    // Create the images
    const imagePromises = images.map((image: { url: string }) => {
      return prisma.image.create({
        data: {
          url: image.url,
          wishboardId: wishboard.id,
        },
      });
    });

    await Promise.all(imagePromises);

    return NextResponse.json(wishboard);
  } catch (error) {
    console.error("Error creating wishboard:", error);
    return NextResponse.json(
      { error: "Error creating wishboard" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to view wishboards" },
        { status: 401 }
      );
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

    return NextResponse.json({ wishboards });
  } catch (error) {
    console.error("Error fetching wishboards:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishboards" },
      { status: 500 }
    );
  }
}
