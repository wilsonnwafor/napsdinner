import {
  users, orders, orderItems, ticketCodes, awards, awardees, votes, artists, contestEntries, systemLogs,
  type User, type InsertUser, type Order, type OrderWithItems, type InsertOrder, type InsertOrderItem,
  type Award, type AwardWithAwardees, type InsertAward, type Awardee, type AwardeeWithVotes, type InsertAwardee,
  type Vote, type InsertVote, type Artist, type InsertArtist, type ContestEntry, type InsertContestEntry,
  type TicketCode, type SystemLog
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count, sql, inArray, not } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Ticket management
  getAvailableTicketCodes(quantity: number): Promise<number[]>;
  assignTicketCodes(codes: number[], orderId: string): Promise<void>;
  getRemainingTicketsCount(): Promise<number>;

  // Order management
  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItem(item: InsertOrderItem): Promise<void>;
  getOrderById(id: string): Promise<OrderWithItems | undefined>;
  getOrderByPaystackRef(ref: string): Promise<Order | undefined>;
  updateOrderStatus(id: string, status: string, paystackRef?: string): Promise<void>;
  getOrders(limit?: number, offset?: number): Promise<OrderWithItems[]>;
  getOrdersCount(): Promise<number>;

  // Awards and voting
  getAwards(): Promise<AwardWithAwardees[]>;
  getAwardById(id: string): Promise<Award | undefined>;
  getAwardeeBySlug(slug: string): Promise<AwardeeWithVotes | undefined>;
  createVote(vote: InsertVote): Promise<Vote>;
  hasUserVoted(awardId: string, emailHash: string): Promise<boolean>;
  getVotesByAward(awardId: string): Promise<Vote[]>;

  // Artists
  createArtist(artist: InsertArtist): Promise<Artist>;
  getArtistByReferralCode(code: string): Promise<Artist | undefined>;
  getArtistByEmail(email: string): Promise<Artist | undefined>;
  updateArtistReferrals(id: string, count: number): Promise<void>;
  approveArtist(id: string): Promise<void>;
  getArtists(): Promise<Artist[]>;

  // Contest entries
  createContestEntry(entry: InsertContestEntry): Promise<ContestEntry>;
  getContestEntries(): Promise<ContestEntry[]>;
  updateContestEntryShortlist(id: string, isShortlisted: boolean): Promise<void>;

  // System logs
  createLog(type: string, data: any, success: boolean): Promise<void>;
  getLogs(type?: string, limit?: number): Promise<SystemLog[]>;

  // Analytics
  getTotalRevenue(): Promise<number>;
  getSalesByCategory(): Promise<Array<{ category: string; count: number; revenue: number }>>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAvailableTicketCodes(quantity: number): Promise<number[]> {
    const codes = await db
      .select({ code: ticketCodes.code })
      .from(ticketCodes)
      .where(eq(ticketCodes.isAssigned, false))
      .orderBy(ticketCodes.code)
      .limit(quantity)
      .for('update');
    
    return codes.map(c => c.code);
  }

  async assignTicketCodes(codes: number[], orderId: string): Promise<void> {
    await db
      .update(ticketCodes)
      .set({
        isAssigned: true,
        orderId,
        assignedAt: new Date()
      })
      .where(inArray(ticketCodes.code, codes));
  }

  async getRemainingTicketsCount(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(ticketCodes)
      .where(eq(ticketCodes.isAssigned, false));
    
    return result.count;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async createOrderItem(item: InsertOrderItem): Promise<void> {
    await db.insert(orderItems).values(item);
  }

  async getOrderById(id: string): Promise<OrderWithItems | undefined> {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: { items: true }
    });
    return order;
  }

  async getOrderByPaystackRef(ref: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.paystackReference, ref));
    return order || undefined;
  }

  async updateOrderStatus(id: string, status: string, paystackRef?: string): Promise<void> {
    const updateData: any = { status };
    if (paystackRef) updateData.paystackReference = paystackRef;
    
    await db.update(orders).set(updateData).where(eq(orders.id, id));
  }

  async getOrders(limit = 50, offset = 0): Promise<OrderWithItems[]> {
    const ordersResult = await db.query.orders.findMany({
      with: { items: true },
      orderBy: desc(orders.createdAt),
      limit,
      offset
    });
    return ordersResult;
  }

  async getOrdersCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(orders);
    return result.count;
  }

  async getAwards(): Promise<AwardWithAwardees[]> {
    const awardsResult = await db.query.awards.findMany({
      where: eq(awards.isActive, true),
      with: { awardees: true },
      orderBy: awards.createdAt
    });
    return awardsResult;
  }

  async getAwardById(id: string): Promise<Award | undefined> {
    const [award] = await db.select().from(awards).where(eq(awards.id, id));
    return award || undefined;
  }

  async getAwardeeBySlug(slug: string): Promise<AwardeeWithVotes | undefined> {
    const awardee = await db.query.awardees.findFirst({
      where: eq(awardees.slug, slug),
      with: { votes: true }
    });

    if (!awardee) return undefined;

    const [voteCountResult] = await db
      .select({ count: count() })
      .from(votes)
      .where(eq(votes.awardeeId, awardee.id));

    return {
      ...awardee,
      voteCount: voteCountResult.count
    };
  }

  async createVote(vote: InsertVote): Promise<Vote> {
    const [newVote] = await db.insert(votes).values(vote).returning();
    return newVote;
  }

  async hasUserVoted(awardId: string, emailHash: string): Promise<boolean> {
    const [result] = await db
      .select({ count: count() })
      .from(votes)
      .where(and(eq(votes.awardId, awardId), eq(votes.voterEmailHash, emailHash)));
    
    return result.count > 0;
  }

  async getVotesByAward(awardId: string): Promise<Vote[]> {
    return await db.select().from(votes).where(eq(votes.awardId, awardId));
  }

  async createArtist(artist: InsertArtist): Promise<Artist> {
    const referralCode = `artist_${randomUUID().slice(0, 8)}`;
    const [newArtist] = await db
      .insert(artists)
      .values({ ...artist, referralCode })
      .returning();
    return newArtist;
  }

  async getArtistByReferralCode(code: string): Promise<Artist | undefined> {
    const [artist] = await db.select().from(artists).where(eq(artists.referralCode, code));
    return artist || undefined;
  }

  async getArtistByEmail(email: string): Promise<Artist | undefined> {
    const [artist] = await db.select().from(artists).where(eq(artists.email, email));
    return artist || undefined;
  }

  async updateArtistReferrals(id: string, count: number): Promise<void> {
    await db.update(artists).set({ referredSales: count }).where(eq(artists.id, id));
    
    // Auto-approve if reached 5 referrals
    if (count >= 5) {
      await db.update(artists).set({ 
        status: 'approved',
        approvedAt: new Date()
      }).where(eq(artists.id, id));
    }
  }

  async approveArtist(id: string): Promise<void> {
    await db.update(artists).set({ 
      status: 'approved',
      approvedAt: new Date()
    }).where(eq(artists.id, id));
  }

  async getArtists(): Promise<Artist[]> {
    return await db.select().from(artists).orderBy(desc(artists.createdAt));
  }

  async createContestEntry(entry: InsertContestEntry): Promise<ContestEntry> {
    const [newEntry] = await db.insert(contestEntries).values(entry).returning();
    return newEntry;
  }

  async getContestEntries(): Promise<ContestEntry[]> {
    return await db.select().from(contestEntries).orderBy(desc(contestEntries.createdAt));
  }

  async updateContestEntryShortlist(id: string, isShortlisted: boolean): Promise<void> {
    await db.update(contestEntries).set({ isShortlisted }).where(eq(contestEntries.id, id));
  }

  async createLog(type: string, data: any, success: boolean): Promise<void> {
    await db.insert(systemLogs).values({ type, data, success });
  }

  async getLogs(type?: string, limit = 100): Promise<SystemLog[]> {
    let query = db.select().from(systemLogs);
    
    if (type) {
      query = query.where(eq(systemLogs.type, type));
    }
    
    return await query.orderBy(desc(systemLogs.createdAt)).limit(limit);
  }

  async getTotalRevenue(): Promise<number> {
    const [result] = await db
      .select({ total: sql<string>`sum(${orders.totalAmount})` })
      .from(orders)
      .where(eq(orders.status, 'confirmed'));
    
    return parseFloat(result.total || '0');
  }

  async getSalesByCategory(): Promise<Array<{ category: string; count: number; revenue: number }>> {
    const results = await db
      .select({
        category: orderItems.category,
        count: sql<number>`sum(${orderItems.quantity})`,
        revenue: sql<string>`sum(${orderItems.quantity} * ${orderItems.unitPrice})`
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(eq(orders.status, 'confirmed'))
      .groupBy(orderItems.category);

    return results.map(r => ({
      ...r,
      revenue: parseFloat(r.revenue)
    }));
  }
}

export const storage = new DatabaseStorage();
