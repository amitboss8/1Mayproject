import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as UserType } from "@shared/schema";
import { pool } from "./db";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

// For TypeScript Express session augmentation
declare global {
  namespace Express {
    interface User extends UserType {
      isAdmin?: boolean;
    }
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'indianotp-secret-key-2025',
    resave: false,
    saveUninitialized: false,
    store: new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true,
      tableName: 'sessions'
    }),
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password'
    }, async (username, password, done) => {
      try {
        console.log(`Login attempt for username: ${username}`);
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          console.log(`User not found: ${username}`);
          return done(null, false, { message: 'Invalid credentials' });
        }
        
        console.log(`User found: ${username}`);
        console.log(`Password comparison: ${password} vs ${user.password}`);
        
        const isValidPassword = user.password === password; // Direct comparison for now
        if (!isValidPassword) {
          console.log(`Password mismatch for user: ${username}`);
          return done(null, false, { message: 'Invalid credentials' });
        }
        
        console.log(`Password correct for user: ${username}`);
        
        // Check for admin account
        const isAdmin = username === "indianotp.in" && password === "Achara";
        if (isAdmin) {
          console.log(`Admin login detected for: ${username}`);
          (user as any).isAdmin = true;
        }
        
        console.log(`Login successful for: ${username}`);
        return done(null, user);
      } catch (error) {
        console.error(`Login error for ${username}:`, error);
        return done(error);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      
      // If this is the admin account, add isAdmin flag
      if (user && user.username === "indianotp.in") {
        (user as any).isAdmin = true;
      }
      
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Register routes
  app.post("/api/auth/register", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password, referralCode, referredBy } = req.body;
      
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Create new user
      const user = await storage.createUser({
        username,
        password,
        referralCode,
        referredBy
      });

      // Log user in after registration
      req.login(user, (err: any) => {
        if (err) return next(err);
        return res.status(201).json(user);
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || 'Invalid credentials' });
      }
      req.login(user, (err: any) => {
        if (err) {
          return next(err);
        }
        
        // Check if this is admin login
        const isAdmin = req.body.username === "indianotp.in" && req.body.password === "Achara";
        const userData = { ...user, isAdmin };
        
        return res.json(userData);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req: Request, res: Response, next: NextFunction) => {
    req.logout((err: any) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });
}

// Middleware for protected routes
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

// Admin middleware
export const authenticateAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  const user = req.user;
  if (!user.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  
  next();
};