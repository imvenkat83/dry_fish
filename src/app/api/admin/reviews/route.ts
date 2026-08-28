import { client } from "@/db";
import { verifyAdminRequest } from "@/utils/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

let isMigrated = false;
async function ensureReviewsColumns() {
  if (isMigrated) return;
  try {
    await client.execute(`ALTER TABLE reviews ADD COLUMN image_url TEXT;`);
  } catch {}
  try {
    await client.execute(`ALTER TABLE reviews ADD COLUMN button_text TEXT;`);
  } catch {}
  try {
    await client.execute(`ALTER TABLE reviews ADD COLUMN button_link TEXT;`);
  } catch {}
  isMigrated = true;
}

async function isAdmin(request?: Request) {
  return !!(await verifyAdminRequest(request));
}

// GET: Fetch all reviews
export async function GET() {
  try {
    await ensureReviewsColumns();
    const result = await client.execute(`
      SELECT 
        id,
        user_name AS userName,
        rating,
        comment,
        designation,
        image_url AS imageUrl,
        button_text AS buttonText,
        button_link AS buttonLink,
        created_at AS createdAt
      FROM reviews
      ORDER BY id DESC
    `);

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error("Fetch Reviews Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST: Add a new review
export async function POST(request: Request) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureReviewsColumns();
    const body = await request.json();
    const { userName, rating, comment, designation, imageUrl, buttonText, buttonLink } = body;

    if (!userName || !comment) {
      return NextResponse.json({ success: false, error: "User Name and Comment are required" }, { status: 400 });
    }

    const cleanUserName = userName.trim();
    const cleanRating = Number(rating) || 5;
    const cleanComment = comment.trim();
    const cleanDesignation = designation ? designation.trim() : "Verified Buyer";
    const cleanImageUrl = imageUrl ? imageUrl.trim() : null;
    const cleanButtonText = buttonText ? buttonText.trim() : "EXPLORE COLLECTION";
    const cleanButtonLink = buttonLink ? buttonLink.trim() : "/all";
    const now = new Date().toISOString();

    await client.execute({
      sql: `INSERT INTO reviews (user_name, rating, comment, designation, image_url, button_text, button_link, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [cleanUserName, cleanRating, cleanComment, cleanDesignation, cleanImageUrl, cleanButtonText, cleanButtonLink, now]
    });

    return NextResponse.json({ success: true, message: "Review added successfully" });
  } catch (error: any) {
    console.error("Add Review Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to add review" }, { status: 500 });
  }
}

// PUT: Update an existing review
export async function PUT(request: Request) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureReviewsColumns();
    const body = await request.json();
    const { id, userName, rating, comment, designation, imageUrl, buttonText, buttonLink } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Review ID is required" }, { status: 400 });
    }

    const cleanUserName = userName.trim();
    const cleanRating = Number(rating) || 5;
    const cleanComment = comment.trim();
    const cleanDesignation = designation ? designation.trim() : "Verified Buyer";
    const cleanImageUrl = imageUrl ? imageUrl.trim() : null;
    const cleanButtonText = buttonText ? buttonText.trim() : "EXPLORE COLLECTION";
    const cleanButtonLink = buttonLink ? buttonLink.trim() : "/all";

    await client.execute({
      sql: `UPDATE reviews
            SET user_name = ?, rating = ?, comment = ?, designation = ?, image_url = ?, button_text = ?, button_link = ?
            WHERE id = ?`,
      args: [cleanUserName, cleanRating, cleanComment, cleanDesignation, cleanImageUrl, cleanButtonText, cleanButtonLink, Number(id)]
    });

    return NextResponse.json({ success: true, message: "Review updated successfully" });
  } catch (error: any) {
    console.error("Update Review Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update review" }, { status: 500 });
  }
}

// DELETE: Remove a review
export async function DELETE(request: Request) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Review ID is required" }, { status: 400 });
    }

    await client.execute({
      sql: `DELETE FROM reviews WHERE id = ?`,
      args: [Number(id)]
    });

    return NextResponse.json({ success: true, message: "Review deleted successfully" });
  } catch (error: any) {
    console.error("Delete Review Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete review" }, { status: 500 });
  }
}
