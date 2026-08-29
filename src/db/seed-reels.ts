import { client } from "./index";

async function seed() {
  console.log("Seeding sample Reels...");
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

    // Check count
    const existing = await client.execute("SELECT COUNT(*) as count FROM reels");
    const count = Number(existing.rows[0]?.count || 0);

    if (count === 0) {
      // Fetch an actual existing product ID from products table
      const prodRes = await client.execute("SELECT id FROM products LIMIT 1");
      const validProdId = prodRes.rows[0]?.id ? Number(prodRes.rows[0].id) : null;

      const sampleReels = [
        {
          title: "King fish (வஞ்சரம் boneless) Recipe",
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
          thumbnailUrl: "/images/banner_2.png",
          productId: validProdId,
          badgeText: "NEW",
          viewsCount: "2.9M",
          displayOrder: 1,
        },
        {
          title: "Babyprawns Thokku Combo",
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
          thumbnailUrl: "/images/banner_2.png",
          productId: validProdId,
          badgeText: "NEW",
          viewsCount: "1.9M",
          displayOrder: 2,
        },
        {
          title: "Ready to Eat Coastal Combo",
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
          thumbnailUrl: "/images/banner_2.png",
          productId: validProdId,
          badgeText: "NEW",
          viewsCount: "1.9M",
          displayOrder: 3,
        },
        {
          title: "Traditional Dried Mutton Karuvadu",
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
          thumbnailUrl: "/images/banner_2.png",
          productId: validProdId,
          badgeText: "NEW",
          viewsCount: "2.7M",
          displayOrder: 4,
        },
        {
          title: "Ribbon Fish (வாளை) Sun-dried",
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
          thumbnailUrl: "/images/banner_2.png",
          productId: validProdId,
          badgeText: "NEW",
          viewsCount: "2.5M",
          displayOrder: 5,
        },
      ];

      for (const r of sampleReels) {
        await client.execute({
          sql: `INSERT INTO reels (title, video_url, thumbnail_url, product_id, badge_text, views_count, display_order, is_active, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
          args: [r.title, r.videoUrl, r.thumbnailUrl, r.productId, r.badgeText, r.viewsCount, r.displayOrder, new Date().toISOString()],
        });
      }
      console.log("SUCCESS: Seeded 5 sample reels!");
    } else {
      console.log(`Reels table already contains ${count} items.`);
    }
  } catch (err) {
    console.error("Seeding error:", err);
  }
  process.exit(0);
}

seed();
