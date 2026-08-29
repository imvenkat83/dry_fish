import { sqliteTable, text, integer, blob, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  phoneNumber: text("phone_number").notNull().unique(),
  fullName: text("full_name"),
  email: text("email"),
  role: text("role").default("user"), // user, admin
  address: text("address"), // Default shipping address
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  lastLoginAt: text("last_login_at"),
});

export const otpVerifications = sqliteTable("otp_verifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  phoneNumber: text("phone_number").notNull(),
  otp: text("otp").notNull(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});


export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  basePrice: real("base_price").notNull(),
  salePrice: real("sale_price"),
  avgRating: real("avg_rating").default(4.3),
  numReviews: integer("num_reviews").default(1),
  images: text("images"), // JSON string array of URLs
  colors: text("colors"),  // JSON string array of colour names
  gender: text("gender", { enum: ["men", "women", "unisex"] }),
  category: text("category"),
  tags: text("tags"),       // comma-separated tags
  isFeatured: integer("is_featured", { mode: "boolean" }).default(false),
  isCustomizable: integer("is_customizable", { mode: "boolean" }).default(false),
  enabledMeasurements: text("enabled_measurements"), // JSON string array
  style: text("style"),
  fabricComposition: text("fabric_composition"),
  weave: text("weave"),
  neckStyle: text("neck_style"),
  keyWords: text("key_words"),
  filterCategory: text("filter_category"),
  specifications: text("specifications"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const productVariations = sqliteTable("product_variations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").references(() => products.id, { onDelete: "cascade" }),
  size: text("size").notNull(),
  stock: integer("stock").notNull().default(0),
  sku: text("sku"),
  color: text("color"),
  mrp: real("mrp"),
  salePrice: real("sale_price"),
});

export const productCustomisationRules = sqliteTable("product_customisation_rules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").references(() => products.id),
  attributeName: text("attribute_name"), 
  minAdjustment: real("min_adjustment"), 
  maxAdjustment: real("max_adjustment"), 
  step: real("step"), 
});

export const cartItems = sqliteTable("cart_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id), 
  productId: integer("product_id").references(() => products.id),
  baseSize: text("base_size").notNull(), 
  customSpecifications: blob("custom_specifications", { mode: "json" }), 
  itemHash: text("item_hash").notNull(), 
  quantity: integer("quantity").notNull().default(1),
  price: real("price").notNull(),
});


export const navigationMenu = sqliteTable("navigation_menu", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  label: text("label").notNull(),
  href: text("href").notNull(),
  imageUrl: text("image_url"),
  order: integer("order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  filterTypes: text("filter_types"),
});

export const pageSections = sqliteTable("page_sections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  menuId: integer("menu_id").notNull().references(() => navigationMenu.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  productIds: text("product_ids").notNull(), // Comma-separated or JSON string of product IDs
  displayOrder: integer("display_order").notNull().default(0),
});



export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  totalAmount: real("total_amount").notNull(),
  status: text("status").default("payment_pending"), // payment_pending, pending, Confirmed, Processing, Ready to Ship, Shipped, Delivered, Cancelled
  shippingAddress: text("shipping_address"),
  couponCode: text("coupon_code"),
  discountAmount: real("discount_amount"),
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  razorpaySignature: text("razorpay_signature"),
  paymentStatus: text("payment_status").default("pending"), // pending, paid
  courierServiceName: text("courier_service_name"),
  courierId: text("courier_id"),
  trackingNumber: text("tracking_number"),
  trackingLink: text("tracking_link"),
  estimatedDeliveryDate: integer("estimated_delivery_date", { mode: "timestamp" }),
  shippingNotes: text("shipping_notes"),
  cancellationReason: text("cancellation_reason"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id),
  variationId: integer("variation_id").references(() => productVariations.id),
  quantity: integer("quantity").notNull().default(1),
  price: real("price").notNull(),
  size: text("size").notNull(),
  color: text("color"),
  customizations: text("customizations"), // JSON string of bespoke measurements
});

export const siteSettings = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});

export const offerBanners = sqliteTable("offer_banners", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  text: text("text").notNull(),
  link: text("link"),
  order: integer("order").notNull().default(0),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const homepageCategories = sqliteTable("homepage_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  promoText: text("promo_text").notNull(),
  actionText: text("action_text").default("Shop Now"),
  link: text("link"),
  order: integer("order").notNull().default(0),
  filterTypes: text("filter_types"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const wishlists = sqliteTable("wishlists", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  category: text("category").notNull(), // e.g. 'meetups', 'workshops', 'performances', 'ramp-walks', 'fashion-expo', 'screening', 'carnivals-fairs', 'sports-fitness', 'concerts-music', 'cultural-gatherings', 'picnics-social', 'adventure'
  description: text("description"),
  imageUrl: text("image_url"), // JSON string array of image/video URLs
  date: text("date").notNull(), // e.g. "Sat 20 Jun 2026 - Sat 27 Jun 2026"
  time: text("time").notNull(), // e.g. "7:00 PM"
  duration: text("duration"), // e.g. "1 Hour"
  ageLimit: text("age_limit"), // e.g. "21yrs +"
  language: text("language"), // e.g. "English, Hindi"
  genre: text("genre"), // e.g. "Bollywood"
  location: text("location").notNull(), // e.g. "Mindspace Social: Hyderabad"
  cost: text("cost").notNull(), // e.g. "₹299 onwards"
  bookingUrl: text("booking_url"), // RSVP URL
  disclaimer: text("disclaimer"), // Disclaimer text
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const eventRegistrations = sqliteTable("event_registrations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  ticketsCount: integer("tickets_count").notNull().default(1),
  additionalNotes: text("additional_notes"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const coupons = sqliteTable("coupons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  description: text("description").notNull(),
  discountType: text("discount_type").notNull(), // 'flat', 'percentage'
  discountValue: real("discount_value").notNull(),
  minPurchaseAmount: real("min_purchase_amount").notNull().default(0),
  cutoffPrice: real("cutoff_price"),
  targetType: text("target_type").notNull().default("all"), // 'all', 'first_order', 'category', 'product'
  targetValue: text("target_value"), // e.g. "Ethnic Wear" or a comma-separated list of product IDs/SKUs
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userName: text("user_name").notNull(),
  rating: integer("rating").notNull().default(5),
  comment: text("comment").notNull(),
  designation: text("designation").default("Verified Buyer"),
  imageUrl: text("image_url"),
  buttonText: text("button_text").default("EXPLORE COLLECTION"),
  buttonLink: text("button_link").default("/all"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});
export const faqs = sqliteTable("faqs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const blogs = sqliteTable("blogs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  summary: text("summary").notNull(),
  content: text("content").notNull(),
  coverImage: text("cover_image").notNull(),
  publishedAt: text("published_at").$defaultFn(() => new Date().toISOString()),
  author: text("author").default("Admin"),
});

export const reels = sqliteTable("reels", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  productId: integer("product_id").references(() => products.id, { onDelete: "set null" }),
  badgeText: text("badge_text").default("NEW"),
  viewsCount: text("views_count").default("2.5M"),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});
