import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for admin authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default('admin'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Ticket codes pool (501-1000)
export const ticketCodes = pgTable("ticket_codes", {
  code: integer("code").primaryKey(),
  isAssigned: boolean("is_assigned").default(false).notNull(),
  orderId: varchar("order_id"),
  assignedAt: timestamp("assigned_at"),
}, (table) => ({
  assignedIdx: index("ticket_codes_assigned_idx").on(table.isAssigned),
}));

// Orders
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paystackReference: text("paystack_reference").unique(),
  status: text("status").notNull().default('pending'), // pending, confirmed, cancelled
  artistRef: text("artist_ref"), // for artist referrals
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("orders_email_idx").on(table.customerEmail),
  statusIdx: index("orders_status_idx").on(table.status),
  paystackIdx: uniqueIndex("orders_paystack_idx").on(table.paystackReference),
}));

// Order items
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  category: text("category").notNull(), // regular, couples, vip, sponsors
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  ticketCodes: jsonb("ticket_codes").$type<number[]>().default([]).notNull(),
});

// Awards and nominees
export const awards = pgTable("awards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  showPublicCounts: boolean("show_public_counts").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const awardees = pgTable("awardees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  awardId: varchar("award_id").notNull().references(() => awards.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  bio: text("bio"),
  photoUrl: text("photo_url"),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  slugIdx: uniqueIndex("awardees_slug_idx").on(table.slug),
}));

// Votes
export const votes = pgTable("votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  awardId: varchar("award_id").notNull().references(() => awards.id, { onDelete: "cascade" }),
  awardeeId: varchar("awardee_id").notNull().references(() => awardees.id, { onDelete: "cascade" }),
  voterEmailHash: text("voter_email_hash").notNull(),
  voterIp: text("voter_ip").notNull(),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueVoteIdx: uniqueIndex("votes_unique_idx").on(table.awardId, table.voterEmailHash),
  emailHashIdx: index("votes_email_hash_idx").on(table.voterEmailHash),
}));

// Artists
export const artists = pgTable("artists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  actType: text("act_type").notNull(),
  socialLink: text("social_link"),
  referralCode: text("referral_code").notNull().unique(),
  referredSales: integer("referred_sales").default(0).notNull(),
  status: text("status").notNull().default('pending'), // pending, approved, rejected
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  emailIdx: uniqueIndex("artists_email_idx").on(table.email),
  referralIdx: uniqueIndex("artists_referral_idx").on(table.referralCode),
  statusIdx: index("artists_status_idx").on(table.status),
}));

// MR & MRS Contest entries
export const contestEntries = pgTable("contest_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  department: text("department").notNull(),
  level: text("level").notNull(),
  bio: text("bio").notNull(),
  photoUrl: text("photo_url"),
  isShortlisted: boolean("is_shortlisted").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  emailIdx: uniqueIndex("contest_entries_email_idx").on(table.email),
  shortlistedIdx: index("contest_entries_shortlisted_idx").on(table.isShortlisted),
}));

// System logs
export const systemLogs = pgTable("system_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // payment, email, webhook, etc.
  data: jsonb("data").notNull(),
  success: boolean("success").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  typeIdx: index("system_logs_type_idx").on(table.type),
  createdAtIdx: index("system_logs_created_at_idx").on(table.createdAt),
}));

// Relations
export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}));

export const awardsRelations = relations(awards, ({ many }) => ({
  awardees: many(awardees),
  votes: many(votes),
}));

export const awardeesRelations = relations(awardees, ({ one, many }) => ({
  award: one(awards, {
    fields: [awardees.awardId],
    references: [awards.id],
  }),
  votes: many(votes),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  award: one(awards, {
    fields: [votes.awardId],
    references: [awards.id],
  }),
  awardee: one(awardees, {
    fields: [votes.awardeeId],
    references: [awardees.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  totalAmount: true,
  artistRef: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  category: true,
  quantity: true,
  unitPrice: true,
});

export const insertAwardSchema = createInsertSchema(awards).pick({
  title: true,
  description: true,
});

export const insertAwardeeSchema = createInsertSchema(awardees).pick({
  awardId: true,
  name: true,
  bio: true,
  photoUrl: true,
  slug: true,
});

export const insertVoteSchema = createInsertSchema(votes).pick({
  awardId: true,
  awardeeId: true,
  voterEmailHash: true,
  voterIp: true,
  userAgent: true,
});

export const insertArtistSchema = createInsertSchema(artists).pick({
  name: true,
  email: true,
  phone: true,
  actType: true,
  socialLink: true,
});

export const insertContestEntrySchema = createInsertSchema(contestEntries).pick({
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  department: true,
  level: true,
  bio: true,
  photoUrl: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type OrderWithItems = Order & { items: OrderItem[] };

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

export type InsertAward = z.infer<typeof insertAwardSchema>;
export type Award = typeof awards.$inferSelect;
export type AwardWithAwardees = Award & { awardees: Awardee[] };

export type InsertAwardee = z.infer<typeof insertAwardeeSchema>;
export type Awardee = typeof awardees.$inferSelect;
export type AwardeeWithVotes = Awardee & { votes: Vote[]; voteCount: number };

export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votes.$inferSelect;

export type InsertArtist = z.infer<typeof insertArtistSchema>;
export type Artist = typeof artists.$inferSelect;

export type InsertContestEntry = z.infer<typeof insertContestEntrySchema>;
export type ContestEntry = typeof contestEntries.$inferSelect;

export type TicketCode = typeof ticketCodes.$inferSelect;
export type SystemLog = typeof systemLogs.$inferSelect;
