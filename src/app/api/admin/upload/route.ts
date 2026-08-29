import { verifyAdminRequest } from "@/utils/auth";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

// Configure Cloudinary with keys from environment variables or fallback credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "qtwfvzzj",
  api_key: process.env.CLOUDINARY_API_KEY || "764359716652958",
  api_secret: process.env.CLOUDINARY_API_SECRET || "HT4eIPfBM_TTdamuBKNnb2sEKVI",
});

async function isAdmin(request?: Request) {
  return !!(await verifyAdminRequest(request));
}

export async function POST(request: Request) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 1. Try uploading to Cloudinary
    try {
      const mimeType = file.type || (file.name.endsWith(".mp4") ? "video/mp4" : "image/jpeg");
      const base64Data = `data:${mimeType};base64,${buffer.toString("base64")}`;

      const uploadResult = await cloudinary.uploader.upload(base64Data, {
        folder: "dry_fish_basket_store",
        resource_type: "auto",
        timeout: 15000,
      });

      const secureUrl = uploadResult?.secure_url || uploadResult?.url;
      if (secureUrl) {
        return NextResponse.json({ success: true, url: secureUrl });
      }
    } catch (cloudinaryErr: any) {
      console.warn("Cloudinary upload failed/timed out, saving locally:", cloudinaryErr.message || cloudinaryErr);
    }

    // 2. Local File System Fallback (Guaranteed to work instantly)
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFileName = `${Date.now()}_${sanitizedOriginalName}`;
    const filePath = path.join(uploadsDir, uniqueFileName);

    await fs.promises.writeFile(filePath, buffer);
    const localUrl = `/uploads/${uniqueFileName}`;

    return NextResponse.json({ success: true, url: localUrl });
  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload file." },
      { status: 500 }
    );
  }
}
