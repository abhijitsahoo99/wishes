import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import { join } from "path";
import { authOptions } from "../../../lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert the file to a Uint8Array
    const bytes = await file.arrayBuffer();
    const uint8Array = new Uint8Array(bytes);

    // Generate a unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${uniqueSuffix}-${file.name}`;

    // Save the file to the public directory
    const publicDir = join(process.cwd(), "public", "uploads");
    await writeFile(join(publicDir, filename), uint8Array);

    // Return the file URL directly without creating a wishboard
    return NextResponse.json({
      id: uniqueSuffix,
      url: `/uploads/${filename}`,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Error uploading file" },
      { status: 500 }
    );
  }
}
