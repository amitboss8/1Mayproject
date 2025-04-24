import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertTransactionSchema, 
  insertOtpHistorySchema,
  insertReferralSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  const authenticate = async (req: Request, res: Response, next: Function) => {
    try {
      const userId = req.headers["x-user-id"];
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const user = await storage.getUser(Number(userId));
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      // Add user to request
      (req as any).user = user;
      next();
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  // User routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // If referralCode is provided, credit the referrer
      if (userData.referredBy) {
        const referrer = await storage.getUserByUsername(userData.referredBy);
        if (referrer) {
          // Will credit the referrer after user is created
        }
      }
      
      const user = await storage.createUser(userData);
      
      // Create response user without password
      const userResponse = {
        id: user.id,
        username: user.username,
        balance: user.balance,
        referralCode: user.referralCode
      };
      
      return res.status(201).json(userResponse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Create response user without password
      const userResponse = {
        id: user.id,
        username: user.username,
        balance: user.balance,
        referralCode: user.referralCode
      };
      
      return res.status(200).json(userResponse);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/user", authenticate, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      
      // Create response user without password
      const userResponse = {
        id: user.id,
        username: user.username,
        balance: user.balance,
        referralCode: user.referralCode
      };
      
      return res.status(200).json(userResponse);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Wallet routes
  app.get("/api/wallet/transactions", authenticate, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      
      const transactions = await storage.getUserTransactions(user.id);
      return res.status(200).json(transactions);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/wallet/add", authenticate, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { amount } = req.body;
      
      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }
      
      // Update user balance
      const updatedUser = await storage.updateUserBalance(user.id, amount);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create transaction record
      const transaction = await storage.createTransaction({
        userId: user.id,
        amount,
        type: "add",
        note: "Added via UPI"
      });
      
      return res.status(200).json({
        balance: updatedUser.balance,
        transaction
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // OTP routes
  app.post("/api/otp/generate", authenticate, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { serviceId, serviceName, price } = req.body;
      
      // Default cost or use the price from the selected service
      const cost = price ? parseFloat(price) : 1;
      const service = serviceName || "Generic";
      
      // Check if user has enough balance
      if (user.balance < cost) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Generate random 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Deduct the cost from user's balance
      const updatedUser = await storage.updateUserBalance(user.id, -cost);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create transaction record with service info
      await storage.createTransaction({
        userId: user.id,
        amount: -cost,
        type: "deduct",
        note: `OTP Generated for ${service}`
      });
      
      // Create OTP history record with service info
      await storage.createOtpHistory({
        userId: user.id,
        otp,
        serviceId,
        serviceName: service
      });
      
      return res.status(200).json({
        otp,
        cost,
        service,
        balance: updatedUser.balance
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/otp/history", authenticate, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      
      const history = await storage.getUserOtpHistory(user.id);
      return res.status(200).json(history);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/otp/history", authenticate, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      
      await storage.clearUserOtpHistory(user.id);
      return res.status(200).json({ message: "OTP history cleared" });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Referral routes
  app.get("/api/referrals", authenticate, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      
      const referrals = await storage.getUserReferrals(user.id);
      return res.status(200).json(referrals);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
