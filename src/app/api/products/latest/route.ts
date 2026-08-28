import { db } from "@/db";
import { products, productVariations } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const results = await db.select({
      id: products.id,
      name: products.name,
      description: products.description,
      basePrice: products.basePrice,
      salePrice: products.salePrice,
      images: products.images,
      colors: products.colors,
      avgRating: products.avgRating,
      numReviews: products.numReviews,
      category: products.category,
      gender: products.gender,
      isFeatured: products.isFeatured,
      isCustomizable: products.isCustomizable,
      style: products.style,
      neckStyle: products.neckStyle,
      keyWords: products.keyWords,
      totalStock: sql<number>`SUM(${productVariations.stock})`.mapWith(Number)
    })
    .from(products)
    .leftJoin(productVariations, eq(products.id, productVariations.productId))
    .groupBy(products.id)
    .orderBy(desc(products.id))
    .limit(8);

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Error fetching latest products:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
