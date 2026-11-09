import { db } from "@/db";
import { products, productVariations } from "@/db/schema";
import { inArray, eq } from "drizzle-orm";
import CategoryFilterSection from "@/components/CategoryFilterSection";

export const dynamic = "force-dynamic";

export default async function AllProductsPage() {
  // 1. Fetch all active products
  const displayProducts = await db.select()
    .from(products)
    .where(eq(products.isActive, true));

  // 2. Query variations for all products
  const allProductIds = displayProducts.map((p) => p.id);

  let allVariations: any[] = [];
  if (allProductIds.length > 0) {
    allVariations = await db.select()
      .from(productVariations)
      .where(inArray(productVariations.productId, allProductIds));
  }

  // Group sizes and calculate total stock by product ID
  const sizeMap = new Map<number, string[]>();
  const stockMap = new Map<number, number>();
  allVariations.forEach((v) => {
    if (!v.productId) return;
    
    // Group sizes
    if (v.size) {
      const currentSizes = sizeMap.get(v.productId) || [];
      const normalizedSize = v.size.trim();
      if (normalizedSize && !currentSizes.includes(normalizedSize)) {
        currentSizes.push(normalizedSize);
      }
      sizeMap.set(v.productId, currentSizes);
    }

    // Accumulate stock
    const currentStock = stockMap.get(v.productId) || 0;
    stockMap.set(v.productId, currentStock + (v.stock || 0));
  });

  // Attach sizes and totalStock to displayProducts
  const hydratedProducts = displayProducts.map((p) => ({
    ...p,
    imageUrl: null,
    sizes: sizeMap.get(p.id) || [],
    totalStock: stockMap.has(p.id) ? stockMap.get(p.id) : 0,
  }));

  return (
    <div className="w-full bg-[#FAF6ED] min-h-[calc(100vh-48px)] flex flex-col">
      <CategoryFilterSection
        initialSections={[]}
        initialDisplayProducts={hydratedProducts}
        categoryName="All Products"
        slug="all"
        filterTypes={null}
        categoryImages={null}
      />
    </div>
  );
}
