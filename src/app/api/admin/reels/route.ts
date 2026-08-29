import { client } from "@/db";
import { verifyAdminRequest } from "@/utils/auth";
import { getProductImageUrls } from "@/utils/product";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

let isMigrated = false;
async function ensureReelsTable() {
  if (isMigrated) return;
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS reels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        video_url TEXT NOT NULL,
        thumbnail_url TEXT,
        product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
        badge_text TEXT DEFAULT 'NEW',
        views_count TEXT DEFAULT '2.5M',
        display_order INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT
      );
    `);
  } catch (err) {
    console.error("Error creating reels table:", err);
  }
  isMigrated = true;
}

async function isAdmin(request?: Request) {
  return !!(await verifyAdminRequest(request));
}

// GET: Fetch all reels for admin panel
export async function GET() {
  try {
    await ensureReelsTable();
    const result = await client.execute(`
      SELECT 
        r.id,
        r.title,
        r.video_url AS videoUrl,
        r.thumbnail_url AS thumbnailUrl,
        r.product_id AS productId,
        r.badge_text AS badgeText,
        r.views_count AS viewsCount,
        r.display_order AS displayOrder,
        r.is_active AS isActive,
        r.created_at AS createdAt,
        p.name AS productName,
        p.base_price AS productBasePrice,
        p.sale_price AS productSalePrice,
        p.avg_rating AS productAvgRating,
        p.num_reviews AS productNumReviews,
        p.images AS productImages
      FROM reels r
      LEFT JOIN products p ON r.product_id = p.id
      ORDER BY r.display_order ASC, r.id DESC
    `);

    const reels = result.rows.map((row: any) => {
      const parsedImages = getProductImageUrls(row.productImages);
      return {
        ...row,
        isActive: Boolean(row.isActive),
        product: row.productId ? {
          id: row.productId,
          name: row.productName,
          basePrice: row.productBasePrice,
          salePrice: row.productSalePrice,
          avgRating: row.productAvgRating || 4.5,
          numReviews: row.productNumReviews || 120,
          images: parsedImages,
        } : null
      };
    });

    return NextResponse.json({ success: true, data: reels });
  } catch (error: any) {
    console.error("Fetch Admin Reels Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch reels" }, { status: 500 });
  }
}

// POST: Add a new reel
export async function POST(request: Request) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureReelsTable();
    const body = await request.json();
    const { title, videoUrl, thumbnailUrl, productId, badgeText, viewsCount, displayOrder, isActive } = body;

    if (!title || !videoUrl) {
      return NextResponse.json({ success: false, error: "Title and Video URL are required" }, { status: 400 });
    }

    const cleanTitle = title.trim();
    const cleanVideoUrl = videoUrl.trim();
    const cleanThumbnailUrl = thumbnailUrl ? thumbnailUrl.trim() : null;
    const cleanProductId = productId ? Number(productId) : null;
    const cleanBadgeText = badgeText ? badgeText.trim() : "NEW";
    const cleanViewsCount = viewsCount ? viewsCount.trim() : "2.5M";
    const cleanDisplayOrder = Number(displayOrder) || 0;
    const cleanIsActive = isActive === false ? 0 : 1;
    const now = new Date().toISOString();

    await client.execute({
      sql: `INSERT INTO reels (title, video_url, thumbnail_url, product_id, badge_text, views_count, display_order, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [cleanTitle, cleanVideoUrl, cleanThumbnailUrl, cleanProductId, cleanBadgeText, cleanViewsCount, cleanDisplayOrder, cleanIsActive, now]
    });

    return NextResponse.json({ success: true, message: "Reel added successfully" });
  } catch (error: any) {
    console.error("Add Reel Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to add reel" }, { status: 500 });
  }
}

// PUT: Update an existing reel
export async function PUT(request: Request) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureReelsTable();
    const body = await request.json();
    const { id, title, videoUrl, thumbnailUrl, productId, badgeText, viewsCount, displayOrder, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Reel ID is required" }, { status: 400 });
    }

    const cleanTitle = title ? title.trim() : "";
    const cleanVideoUrl = videoUrl ? videoUrl.trim() : "";
    const cleanThumbnailUrl = thumbnailUrl ? thumbnailUrl.trim() : null;
    const cleanProductId = productId ? Number(productId) : null;
    const cleanBadgeText = badgeText ? badgeText.trim() : "NEW";
    const cleanViewsCount = viewsCount ? viewsCount.trim() : "2.5M";
    const cleanDisplayOrder = Number(displayOrder) || 0;
    const cleanIsActive = isActive === false ? 0 : 1;

    await client.execute({
      sql: `UPDATE reels
            SET title = ?, video_url = ?, thumbnail_url = ?, product_id = ?, badge_text = ?, views_count = ?, display_order = ?, is_active = ?
            WHERE id = ?`,
      args: [cleanTitle, cleanVideoUrl, cleanThumbnailUrl, cleanProductId, cleanBadgeText, cleanViewsCount, cleanDisplayOrder, cleanIsActive, Number(id)]
    });

    return NextResponse.json({ success: true, message: "Reel updated successfully" });
  } catch (error: any) {
    console.error("Update Reel Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update reel" }, { status: 500 });
  }
}

// DELETE: Remove a reel
export async function DELETE(request: Request) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Reel ID is required" }, { status: 400 });
    }

    await client.execute({
      sql: `DELETE FROM reels WHERE id = ?`,
      args: [Number(id)]
    });

    return NextResponse.json({ success: true, message: "Reel deleted successfully" });
  } catch (error: any) {
    console.error("Delete Reel Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete reel" }, { status: 500 });
  }
}
