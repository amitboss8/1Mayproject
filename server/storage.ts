import { 
  users, type User, type InsertUser, 
  transactions, type Transaction, type InsertTransaction, 
  otpHistory, type OtpHistory, type InsertOtpHistory,
  referrals, type Referral, type InsertReferral
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(id: number, amount: number): Promise<User | undefined>;
  
  // Transaction operations
  createTransaction(transaction: any): Promise<Transaction>;
  getUserTransactions(userId: number): Promise<Transaction[]>;
  
  // OTP History operations
  createOtpHistory(otpHistory: any): Promise<OtpHistory>;
  getUserOtpHistory(userId: number): Promise<OtpHistory[]>;
  clearUserOtpHistory(userId: number): Promise<void>;
  
  // Referral operations
  createReferral(referral: any): Promise<Referral>;
  getUserReferrals(userId: number): Promise<Referral[]>;
  markReferralCredited(id: number): Promise<Referral | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private otpHistories: Map<number, OtpHistory>;
  private referrals: Map<number, Referral>;
  private userIdCounter: number;
  private transactionIdCounter: number;
  private otpHistoryIdCounter: number;
  private referralIdCounter: number;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.otpHistories = new Map();
    this.referrals = new Map();
    this.userIdCounter = 1;
    this.transactionIdCounter = 1;
    this.otpHistoryIdCounter = 1;
    this.referralIdCounter = 1;
    
    // Create a demo user
    this.createUser({
      username: "demo",
      password: "password",
      referralCode: "DEMO2023",
      referredBy: null
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
    const user: User = { ...insertUser, id, balance: 0 };
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
}

export const storage = new MemStorage();
