import { client } from "@/db";
import { getProductImageUrls } from "@/utils/product";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET: Public active reels endpoint for homepage carousel
export async function GET() {
  try {
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
        p.description AS productDescription,
        p.base_price AS productBasePrice,
        p.sale_price AS productSalePrice,
        p.avg_rating AS productAvgRating,
        p.num_reviews AS productNumReviews,
        p.images AS productImages,
        p.category AS productCategory
      FROM reels r
      LEFT JOIN products p ON r.product_id = p.id
      WHERE r.is_active = 1
      ORDER BY r.display_order ASC, r.id DESC
    `);

    const reels = result.rows.map((row: any) => {
      const parsedImages = getProductImageUrls(row.productImages);
      return {
        id: row.id,
        title: row.title,
        videoUrl: row.videoUrl,
        thumbnailUrl: row.thumbnailUrl,
        badgeText: row.badgeText || "NEW",
        viewsCount: row.viewsCount || "2.5M",
        displayOrder: row.displayOrder || 0,
        product: row.productId ? {
          id: row.productId,
          name: row.productName,
          description: row.productDescription,
          basePrice: row.productBasePrice,
          salePrice: row.productSalePrice,
          avgRating: row.productAvgRating || 4.5,
          numReviews: row.productNumReviews || 120,
          images: parsedImages,
          category: row.productCategory,
        } : null
      };
    });

    return NextResponse.json({ success: true, data: reels });
  } catch (error: any) {
    console.error("Fetch Public Reels Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch reels" }, { status: 500 });
  }
}
