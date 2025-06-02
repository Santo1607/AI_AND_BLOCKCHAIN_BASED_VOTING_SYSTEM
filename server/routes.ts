import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, insertCitizenSchema, verificationSchema } from "@shared/schema";
import multer from "multer";
import path from "path";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin authentication
  app.post("/api/admin/login", async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      const admin = await storage.getAdminByUsername(loginData.username);
      
      if (admin && admin.password === loginData.password && admin.isActive) {
        // In a real app, you'd use proper session management/JWT
        (req as any).session = (req as any).session || {};
        (req as any).session.adminId = admin.id;
        
        res.json({
          success: true,
          admin: {
            id: admin.id,
            name: admin.name,
            username: admin.username
          }
        });
      } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    (req as any).session = null;
    res.json({ success: true });
  });

  app.get("/api/admin/me", async (req, res) => {
    const adminId = (req as any).session?.adminId;
    if (!adminId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const admin = await storage.getAdmin(adminId);
    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    res.json({
      id: admin.id,
      name: admin.name,
      username: admin.username
    });
  });

  // Citizens CRUD operations
  app.get("/api/citizens", async (req, res) => {
    const adminId = (req as any).session?.adminId;
    if (!adminId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { search, district, gender } = req.query;
      const citizens = await storage.searchCitizens(
        search as string || "",
        district as string,
        gender as string
      );
      res.json(citizens);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/citizens/:id", async (req, res) => {
    const adminId = (req as any).session?.adminId;
    if (!adminId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const id = parseInt(req.params.id);
      const citizen = await storage.getCitizen(id);
      
      if (!citizen) {
        return res.status(404).json({ message: "Citizen not found" });
      }
      
      res.json(citizen);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/citizens", upload.single('photo'), async (req, res) => {
    const adminId = (req as any).session?.adminId;
    if (!adminId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const citizenData = insertCitizenSchema.parse(req.body);
      
      // Handle photo upload
      if (req.file) {
        citizenData.photoUrl = `/uploads/${req.file.filename}`;
      }

      const citizen = await storage.createCitizen(citizenData);
      res.status(201).json(citizen);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/citizens/:id", upload.single('photo'), async (req, res) => {
    const adminId = (req as any).session?.adminId;
    if (!adminId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const id = parseInt(req.params.id);
      const updateData = { ...req.body };

      // Handle photo upload
      if (req.file) {
        updateData.photoUrl = `/uploads/${req.file.filename}`;
      }

      const citizen = await storage.updateCitizen(id, updateData);
      
      if (!citizen) {
        return res.status(404).json({ message: "Citizen not found" });
      }
      
      res.json(citizen);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/citizens/:id", async (req, res) => {
    const adminId = (req as any).session?.adminId;
    if (!adminId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCitizen(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Citizen not found" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Public verification
  app.post("/api/verify", async (req, res) => {
    try {
      const verificationData = verificationSchema.parse(req.body);
      const citizen = await storage.verifyCitizen(
        verificationData.aadharNumber,
        verificationData.dateOfBirth
      );
      
      if (citizen) {
        // Return citizen data without sensitive info
        res.json({
          success: true,
          citizen: {
            name: citizen.name,
            aadharNumber: citizen.aadharNumber,
            dateOfBirth: citizen.dateOfBirth,
            gender: citizen.gender,
            address: citizen.address,
            district: citizen.district,
            pincode: citizen.pincode,
            photoUrl: citizen.photoUrl,
            status: citizen.status
          }
        });
      } else {
        res.status(404).json({ 
          success: false, 
          message: "No matching record found. Please check your details." 
        });
      }
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  });

  // Dashboard statistics
  app.get("/api/stats", async (req, res) => {
    const adminId = (req as any).session?.adminId;
    if (!adminId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const allCitizens = await storage.getAllCitizens();
      const totalCitizens = allCitizens.length;
      
      // Mock additional stats for demo
      res.json({
        totalCitizens,
        newRegistrations: Math.floor(totalCitizens * 0.02), // 2% as new
        verificationsToday: Math.floor(totalCitizens * 0.08), // 8% verified today
        systemStatus: "operational"
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
