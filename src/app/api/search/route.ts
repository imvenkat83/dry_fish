import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, productVariations } from "@/db/schema";
import { like, or, inArray, eq, and } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q || q.trim() === "") {
      const allProducts = await db.select().from(products).where(eq(products.isActive, true)).limit(100);
      return NextResponse.json({ success: true, data: allProducts });
    }

    // Clean and split the query into search tokens
    const cleanQuery = q.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ");
    const tokens = cleanQuery
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (tokens.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Expand tokens to support simple singular/plural matching
    const expandedTokensSet = new Set<string>();
    tokens.forEach((t) => {
      expandedTokensSet.add(t);
      if (t.endsWith("s") && t.length > 2) {
        if (t.endsWith("es") && t.length > 3) {
          expandedTokensSet.add(t.slice(0, -2));
        } else {
          expandedTokensSet.add(t.slice(0, -1));
        }
      }
    });
    const expandedTokens = Array.from(expandedTokensSet);

    // Fetch candidate active products matching any of the expanded tokens
    const results = await db.select().from(products).where(
      and(
        or(
          ...expandedTokens.flatMap((t) => [
            like(products.name, `%${t}%`),
            like(products.description, `%${t}%`),
            like(products.category, `%${t}%`),
            like(products.gender, `%${t}%`),
            like(products.tags, `%${t}%`),
            like(products.colors, `%${t}%`)
          ])
        ),
        eq(products.isActive, true)
      )
    ).limit(100);

    // Helper to check if a token matches a text field
    const matchesTextField = (field: string | null, token: string) => {
      if (!field) return false;
      const cleanField = field.toLowerCase();
      const cleanToken = token.toLowerCase();
      
      // If token is short, require whole-word boundary match to avoid substring false positives (e.g. "red" in "embroidered")
      if (cleanToken.length <= 3) {
        const regex = new RegExp(`\\b${cleanToken}\\b`, "i");
        return regex.test(cleanField);
      }
      return cleanField.includes(cleanToken);
    };

    // Helper to check if a token matches colors array/string
    const matchesColorField = (colorsStr: string | null, token: string) => {
      if (!colorsStr) return false;
      const cleanToken = token.toLowerCase();
      try {
        const parsed = JSON.parse(colorsStr);
        if (Array.isArray(parsed)) {
          return parsed.some((c) => c.toLowerCase().trim() === cleanToken);
        }
      } catch {}
      return matchesTextField(colorsStr, token);
    };

    // Helper to check if a token matches tags
    const matchesTagsField = (tagsStr: string | null, token: string) => {
      if (!tagsStr) return false;
      const cleanToken = token.toLowerCase();
      const tagsList = tagsStr.split(",").map((t) => t.trim().toLowerCase());
      return tagsList.some((t) => t === cleanToken || (cleanToken.length > 3 && t.includes(cleanToken)));
    };

    // Score and rank matched products based on original query tokens
    const scoredResults = results.map((p) => {
      let score = 0;

      tokens.forEach((origToken) => {
        const variants = [origToken];
        if (origToken.endsWith("s") && origToken.length > 2) {
          if (origToken.endsWith("es") && origToken.length > 3) {
            variants.push(origToken.slice(0, -2));
          } else {
            variants.push(origToken.slice(0, -1));
          }
        }

        const matchesAnyVariant = variants.some((v) => 
          matchesTextField(p.name, v) ||
          matchesTextField(p.description, v) ||
          matchesTextField(p.category, v) ||
          matchesTextField(p.gender, v) ||
          matchesTagsField(p.tags, v) ||
          matchesColorField(p.colors, v)
        );

        if (matchesAnyVariant) {
          score += 1;
          // Add extra weight if matched in name or tags
          const matchesName = variants.some(v => matchesTextField(p.name, v));
          const matchesTags = variants.some(v => matchesTagsField(p.tags, v));
          if (matchesName) score += 0.5;
          if (matchesTags) score += 0.3;
        }
      });

      return { product: p, score };
    });

    // Sort products by score descending
    const sortedResults = scoredResults
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.product);

    const productIds = sortedResults.map((r) => r.id);
    let variations: any[] = [];
    if (productIds.length > 0) {
      variations = await db.select()
        .from(productVariations)
        .where(inArray(productVariations.productId, productIds));
    }

    // Group sizes by product ID
    const sizeMap = new Map<number, string[]>();
    variations.forEach((v) => {
      if (!v.productId || !v.size) return;
      const currentSizes = sizeMap.get(v.productId) || [];
      const normalizedSize = v.size.trim();
      if (normalizedSize && !currentSizes.includes(normalizedSize)) {
        currentSizes.push(normalizedSize);
      }
      sizeMap.set(v.productId, currentSizes);
    });

    const enrichedResults = sortedResults.map((p) => ({
      ...p,
      sizes: sizeMap.get(p.id) || [],
    }));

    return NextResponse.json({ success: true, data: enrichedResults });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to search products" },
      { status: 500 }
    );
  }
}
