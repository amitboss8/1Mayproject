import { 
  users, type User, type InsertUser, 
  transactions, type Transaction, type InsertTransaction, 
  otpHistory, type OtpHistory, type InsertOtpHistory,
  referrals, type Referral, type InsertReferral,
  balanceRequests, type BalanceRequest, type InsertBalanceRequest
} from "@shared/schema";
import session from "express-session";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(id: number, amount: number): Promise<User | undefined>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: number): Promise<Transaction[]>;
  
  // OTP History operations
  createOtpHistory(otpHistory: InsertOtpHistory): Promise<OtpHistory>;
  getUserOtpHistory(userId: number): Promise<OtpHistory[]>;
  clearUserOtpHistory(userId: number): Promise<void>;
  
  // Referral operations
  createReferral(referral: InsertReferral): Promise<Referral>;
  getUserReferrals(userId: number): Promise<Referral[]>;
  markReferralCredited(id: number): Promise<Referral | undefined>;
  
  // Balance Request operations
  createBalanceRequest(request: InsertBalanceRequest): Promise<BalanceRequest>;
  getBalanceRequest(id: number): Promise<BalanceRequest | undefined>;
  getUserBalanceRequests(userId: number): Promise<BalanceRequest[]>;
  getAllBalanceRequests(): Promise<BalanceRequest[]>;
  updateBalanceRequestStatus(id: number, status: string, adminId?: number): Promise<BalanceRequest | undefined>;
  
  // Session store for authentication
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private otpHistories: Map<number, OtpHistory>;
  private referrals: Map<number, Referral>;
  private balanceRequests: Map<number, BalanceRequest>;
  private userIdCounter: number;
  private transactionIdCounter: number;
  private otpHistoryIdCounter: number;
  private referralIdCounter: number;
  private balanceRequestIdCounter: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.otpHistories = new Map();
    this.referrals = new Map();
    this.balanceRequests = new Map();
    this.userIdCounter = 1;
    this.transactionIdCounter = 1;
    this.otpHistoryIdCounter = 1;
    this.referralIdCounter = 1;
    this.balanceRequestIdCounter = 1;
    
    // Create a memory store for sessions
    const MemoryStore = require('memorystore')(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Create a demo user
    this.createUser({
      username: "demo",
      password: "password",
      referralCode: "DEMO2023",
      referredBy: null,
      isAdmin: false
    });
    
    // Create an admin user
    this.createUser({
      username: "indianotp.in",
      password: "Achara",
      referralCode: "ADMIN2023",
      referredBy: null,
      isAdmin: true
    });
    
    // Add some balance
    this.updateUserBalance(1, 100);
    this.createTransaction({
      userId: 1,
      amount: 100,
      type: "add",
      note: "Initial balance"
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    
    // Ensure the required properties are present
    const user: User = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      balance: 0,
      referralCode: insertUser.referralCode,
      referredBy: insertUser.referredBy || null,
      isAdmin: insertUser.isAdmin || false
    };
    
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(id: number, amount: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, balance: user.balance + amount };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async createTransaction(insertTransaction: any): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const timestamp = new Date();
    const transaction: Transaction = { 
      ...insertTransaction, 
      id,
      timestamp
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createOtpHistory(insertOtpHistory: any): Promise<OtpHistory> {
    const id = this.otpHistoryIdCounter++;
    const timestamp = new Date();
    const otpHistory: OtpHistory = { 
      ...insertOtpHistory, 
      id,
      timestamp
    };
    this.otpHistories.set(id, otpHistory);
    return otpHistory;
  }

  async getUserOtpHistory(userId: number): Promise<OtpHistory[]> {
    return Array.from(this.otpHistories.values())
      .filter(history => history.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async clearUserOtpHistory(userId: number): Promise<void> {
    for (const [id, history] of this.otpHistories.entries()) {
      if (history.userId === userId) {
        this.otpHistories.delete(id);
      }
    }
  }

  async createReferral(insertReferral: any): Promise<Referral> {
    const id = this.referralIdCounter++;
    const timestamp = new Date();
    const referral: Referral = { 
      ...insertReferral, 
      id,
      timestamp,
      credited: false
    };
    this.referrals.set(id, referral);
    return referral;
  }

  async getUserReferrals(userId: number): Promise<Referral[]> {
    return Array.from(this.referrals.values())
      .filter(referral => referral.referrerId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async markReferralCredited(id: number): Promise<Referral | undefined> {
    const referral = this.referrals.get(id);
    if (!referral) return undefined;
    
    const updatedReferral = { ...referral, credited: true };
    this.referrals.set(id, updatedReferral);
    return updatedReferral;
  }
  
  async createBalanceRequest(insertRequest: InsertBalanceRequest): Promise<BalanceRequest> {
    const id = this.balanceRequestIdCounter++;
    const timestamp = new Date();
    
    // Ensure required properties are set
    const request: BalanceRequest = {
      id,
      userId: insertRequest.userId,
      amount: insertRequest.amount,
      utrNumber: insertRequest.utrNumber,
      status: insertRequest.status || "pending",
      timestamp,
      approvedBy: null,
      approvedAt: null,
    };
    
    this.balanceRequests.set(id, request);
    return request;
  }
  
  async getBalanceRequest(id: number): Promise<BalanceRequest | undefined> {
    return this.balanceRequests.get(id);
  }
  
  async getUserBalanceRequests(userId: number): Promise<BalanceRequest[]> {
    return Array.from(this.balanceRequests.values())
      .filter(request => request.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  async getAllBalanceRequests(): Promise<BalanceRequest[]> {
    return Array.from(this.balanceRequests.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  async updateBalanceRequestStatus(id: number, status: string, adminId?: number): Promise<BalanceRequest | undefined> {
    const request = this.balanceRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest: BalanceRequest = {
      ...request,
      status,
      approvedBy: adminId || null,
      approvedAt: status !== "pending" ? new Date() : null,
    };
    
    this.balanceRequests.set(id, updatedRequest);
    return updatedRequest;
  }
}

// Database implementation of IStorage
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true,
      tableName: 'sessions'
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserBalance(id: number, amount: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) return undefined;
    
    const [updatedUser] = await db
      .update(users)
      .set({ balance: user.balance + amount })
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(insertTransaction).returning();
    return transaction;
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.timestamp));
  }

  async createOtpHistory(insertOtpHistory: InsertOtpHistory): Promise<OtpHistory> {
    const [history] = await db.insert(otpHistory).values(insertOtpHistory).returning();
    return history;
  }

  async getUserOtpHistory(userId: number): Promise<OtpHistory[]> {
    return await db
      .select()
      .from(otpHistory)
      .where(eq(otpHistory.userId, userId))
      .orderBy(desc(otpHistory.timestamp));
  }

  async clearUserOtpHistory(userId: number): Promise<void> {
    await db.delete(otpHistory).where(eq(otpHistory.userId, userId));
  }

  async createReferral(insertReferral: InsertReferral): Promise<Referral> {
    const [referral] = await db.insert(referrals).values(insertReferral).returning();
    return referral;
  }

  async getUserReferrals(userId: number): Promise<Referral[]> {
    return await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId))
      .orderBy(desc(referrals.timestamp));
  }

  async markReferralCredited(id: number): Promise<Referral | undefined> {
    const [referral] = await db
      .update(referrals)
      .set({ credited: true })
      .where(eq(referrals.id, id))
      .returning();
    
    return referral;
  }

  async createBalanceRequest(insertRequest: InsertBalanceRequest): Promise<BalanceRequest> {
    const [request] = await db.insert(balanceRequests).values(insertRequest).returning();
    return request;
  }

  async getBalanceRequest(id: number): Promise<BalanceRequest | undefined> {
    const [request] = await db.select().from(balanceRequests).where(eq(balanceRequests.id, id));
    return request;
  }

  async getUserBalanceRequests(userId: number): Promise<BalanceRequest[]> {
    return await db
      .select()
      .from(balanceRequests)
      .where(eq(balanceRequests.userId, userId))
      .orderBy(desc(balanceRequests.timestamp));
  }

  async getAllBalanceRequests(): Promise<BalanceRequest[]> {
    return await db
      .select()
      .from(balanceRequests)
      .orderBy(desc(balanceRequests.timestamp));
  }

  async updateBalanceRequestStatus(id: number, status: string, adminId?: number): Promise<BalanceRequest | undefined> {
    const updates: any = { 
      status,
      approvedBy: adminId || null
    };
    
    if (status !== "pending") {
      updates.approvedAt = new Date();
    }
    
    const [updatedRequest] = await db
      .update(balanceRequests)
      .set(updates)
      .where(eq(balanceRequests.id, id))
      .returning();
    
    return updatedRequest;
  }
}

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
