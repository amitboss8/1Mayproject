import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { 
  insertUserSchema, 
  insertTransactionSchema, 
  insertOtpHistorySchema,
  insertReferralSchema,
  insertBalanceRequestSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve sitemap.xml
  app.get('/sitemap.xml', (req: Request, res: Response) => {
    try {
      const sitemapPath = path.join(process.cwd(), 'sitemap.xml');
      if (fs.existsSync(sitemapPath)) {
        res.setHeader('Content-Type', 'application/xml');
        res.sendFile(sitemapPath);
      } else {
        res.status(404).send('Sitemap not found');
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

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
  
  // Admin middleware
  const authenticateAdmin = async (req: Request, res: Response, next: Function) => {
    try {
      const userId = req.headers["x-user-id"];
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const user = await storage.getUser(Number(userId));
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      if (!user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
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

  // Balance Request routes
  app.post("/api/wallet/balance-request", authenticate, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { amount, utrNumber } = req.body;
      
      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }
      
      if (!utrNumber || typeof utrNumber !== 'string' || utrNumber.trim() === '') {
        return res.status(400).json({ message: "Valid UTR number is required" });
      }
      
      // Create balance request
      const balanceRequest = await storage.createBalanceRequest({
        userId: user.id,
        amount,
        utrNumber,
        status: "pending"
      });
      
      return res.status(201).json(balanceRequest);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/wallet/balance-requests", authenticate, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      
      const requests = await storage.getUserBalanceRequests(user.id);
      return res.status(200).json(requests);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Admin routes for Balance Requests
  app.get("/api/admin/balance-requests", authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const requests = await storage.getAllBalanceRequests();
      return res.status(200).json(requests);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/admin/balance-requests/:id/approve", authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const admin = (req as any).user;
      const requestId = parseInt(req.params.id);
      
      if (isNaN(requestId)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }
      
      // Get the balance request
      const balanceRequest = await storage.getBalanceRequest(requestId);
      if (!balanceRequest) {
        return res.status(404).json({ message: "Balance request not found" });
      }
      
      if (balanceRequest.status !== "pending") {
        return res.status(400).json({ message: "Balance request has already been processed" });
      }
      
      // Update request status
      const updatedRequest = await storage.updateBalanceRequestStatus(requestId, "approved", admin.id);
      
      // Update user balance
      const user = await storage.getUser(balanceRequest.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUserBalance(user.id, balanceRequest.amount);
      
      // Create transaction record
      await storage.createTransaction({
        userId: user.id,
        amount: balanceRequest.amount,
        type: "add",
        note: `Balance request #${requestId} approved`
      });
      
      return res.status(200).json({
        request: updatedRequest,
        user: {
          id: updatedUser?.id,
          username: updatedUser?.username,
          balance: updatedUser?.balance
        }
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/admin/balance-requests/:id/reject", authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const admin = (req as any).user;
      const requestId = parseInt(req.params.id);
      
      if (isNaN(requestId)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }
      
      // Get the balance request
      const balanceRequest = await storage.getBalanceRequest(requestId);
      if (!balanceRequest) {
        return res.status(404).json({ message: "Balance request not found" });
      }
      
      if (balanceRequest.status !== "pending") {
        return res.status(400).json({ message: "Balance request has already been processed" });
      }
      
      // Update request status
      const updatedRequest = await storage.updateBalanceRequestStatus(requestId, "rejected", admin.id);
      
      return res.status(200).json(updatedRequest);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
