import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Find the wishboard
    const wishboard = await prisma.wishboard.findUnique({
      where: {
        id,
      },
    });

    if (!wishboard) {
      return NextResponse.json(
        { error: "Wishboard not found" },
        { status: 404 }
      );
    }

    // Check if the user owns the wishboard
    if (wishboard.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete the wishboard (this will cascade delete images)
    await prisma.wishboard.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting wishboard:", error);
    return NextResponse.json(
      { error: "Failed to delete wishboard" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { name, images } = await request.json();

    // Find the wishboard
    const wishboard = await prisma.wishboard.findUnique({
      where: {
        id,
      },
      include: {
        images: true,
      },
    });

    if (!wishboard) {
      return NextResponse.json(
        { error: "Wishboard not found" },
        { status: 404 }
      );
    }

    // Check if the user owns the wishboard
    if (wishboard.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update the wishboard
    const updatedWishboard = await prisma.wishboard.update({
      where: {
        id,
      },
      data: {
        name: name || wishboard.name,
      },
      include: {
        images: true,
      },
    });

    // If images are provided, update them
    if (images && Array.isArray(images)) {
      // Delete existing images
      await prisma.image.deleteMany({
        where: {
          wishboardId: id,
        },
      });

      // Create new images
      if (images.length > 0) {
        await prisma.image.createMany({
          data: images.map((image: { url: string; caption?: string }) => ({
            url: image.url,
            caption: image.caption,
            wishboardId: id,
          })),
        });
      }

      // Fetch the updated wishboard with images
      const wishboardWithImages = await prisma.wishboard.findUnique({
        where: {
          id,
        },
        include: {
          images: true,
        },
      });

      return NextResponse.json(wishboardWithImages);
    }

    return NextResponse.json(updatedWishboard);
  } catch (error) {
    console.error("Error updating wishboard:", error);
    return NextResponse.json(
      { error: "Failed to update wishboard" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = params;

    // Find the wishboard
    const wishboard = await prisma.wishboard.findUnique({
      where: {
        id,
      },
      include: {
        images: true,
      },
    });

    if (!wishboard) {
      return NextResponse.json(
        { error: "Wishboard not found" },
        { status: 404 }
      );
    }

    // If the user is authenticated and owns the wishboard, return it
    if (session?.user && wishboard.userId === session.user.id) {
      return NextResponse.json(wishboard);
    }

    // If the wishboard is public or the user is not authenticated, return it without sensitive data
    return NextResponse.json({
      id: wishboard.id,
      name: wishboard.name,
      images: wishboard.images,
      createdAt: wishboard.createdAt,
      updatedAt: wishboard.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching wishboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishboard" },
      { status: 500 }
    );
  }
}
