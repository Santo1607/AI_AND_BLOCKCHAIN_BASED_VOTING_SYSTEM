import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";

// Extend session type to include adminId
declare module "express-session" {
  interface SessionData {
    adminId?: number;
  }
}
import { storage } from "./storage";
import { 
  loginSchema, 
  insertCitizenSchema, 
  verificationSchema,
  insertElectionSchema,
  insertCandidateSchema,
  voteSchema,
  voterRegistrationSchema
} from "@shared/schema";
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
        // Store admin ID in session
        (req.session as any).adminId = admin.id;
        
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
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Could not log out" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/admin/me", async (req, res) => {
    const adminId = (req.session as any)?.adminId;
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
    const adminId = (req.session as any)?.adminId;
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
            constituency: citizen.constituency,
            pincode: citizen.pincode,
            photoUrl: citizen.photoUrl,
            fingerprintData: citizen.fingerprintData,
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

  // Voting system routes

  // Elections management
  app.get("/api/elections", async (req, res) => {
    try {
      const elections = await storage.getAllElections();
      res.json(elections);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/elections/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const election = await storage.getElection(id);
      
      if (!election) {
        return res.status(404).json({ message: "Election not found" });
      }
      
      res.json(election);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/elections", async (req, res) => {
    const adminId = (req as any).session?.adminId;
    if (!adminId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const electionData = insertElectionSchema.parse(req.body);
      const election = await storage.createElection(electionData);
      res.status(201).json(election);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Candidates management
  app.get("/api/elections/:electionId/candidates", async (req, res) => {
    try {
      const electionId = parseInt(req.params.electionId);
      const candidates = await storage.getCandidatesByElection(electionId);
      res.json(candidates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/candidates", async (req, res) => {
    const adminId = (req as any).session?.adminId;
    if (!adminId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const candidateData = insertCandidateSchema.parse(req.body);
      const candidate = await storage.createCandidate(candidateData);
      res.status(201).json(candidate);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Voter registration
  app.post("/api/voter/register", async (req, res) => {
    try {
      const registrationData = voterRegistrationSchema.parse(req.body);
      const registration = await storage.registerVoter(registrationData);
      res.status(201).json({
        success: true,
        voterIdNumber: registration.voterIdNumber,
        message: "Voter registration successful"
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  });

  app.post("/api/voter/check-eligibility", async (req, res) => {
    try {
      const { aadharNumber, dateOfBirth } = verificationSchema.parse(req.body);
      const isEligible = await storage.isEligibleToVote(aadharNumber, dateOfBirth);
      
      if (isEligible) {
        const registration = await storage.getVoterRegistration(aadharNumber);
        res.json({
          eligible: true,
          voterIdNumber: registration?.voterIdNumber,
          message: "You are eligible to vote"
        });
      } else {
        res.json({
          eligible: false,
          message: "Not eligible to vote. Please register first or verify your details."
        });
      }
    } catch (error: any) {
      res.status(400).json({ eligible: false, message: error.message });
    }
  });

  // Voting with blockchain integration
  app.post("/api/vote", async (req, res) => {
    try {
      // Check voting hours (8 AM - 5 PM)
      const currentHour = new Date().getHours();
      if (currentHour < 8 || currentHour >= 17) {
        return res.status(403).json({ 
          success: false, 
          message: "Voting is only allowed between 8:00 AM and 5:00 PM. Please come back during voting hours.",
          votingHours: "8:00 AM - 5:00 PM"
        });
      }

      const voteData = {
        ...req.body,
        blockchainHash: req.body.blockchainHash || null,
        transactionHash: req.body.transactionHash || null
      };
      
      // Check if voter is eligible
      const citizen = await storage.getCitizenByAadhar(voteData.voterAadhar);
      if (!citizen) {
        return res.status(404).json({ success: false, message: "Voter not found" });
      }

      const isEligible = await storage.isEligibleToVote(voteData.voterAadhar, citizen.dateOfBirth);
      if (!isEligible) {
        return res.status(403).json({ success: false, message: "Not eligible to vote" });
      }

      // Check if already voted
      const hasVoted = await storage.hasVoted(voteData.electionId, voteData.voterAadhar);
      if (hasVoted) {
        return res.status(409).json({ success: false, message: "You have already voted in this election" });
      }

      // Validate blockchain proof if provided
      if (voteData.blockchainHash && !voteData.transactionHash) {
        return res.status(400).json({ success: false, message: "Blockchain verification incomplete" });
      }

      const vote = await storage.castVote({
        electionId: voteData.electionId,
        candidateId: voteData.candidateId,
        voterAadhar: voteData.voterAadhar,
        blockchainHash: voteData.blockchainHash,
        transactionHash: voteData.transactionHash
      });
      res.json({ success: true, message: "Vote cast successfully", voteId: vote.id });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  });

  app.post("/api/voter/check-vote-status", async (req, res) => {
    try {
      const { electionId, aadharNumber } = req.body;
      const hasVoted = await storage.hasVoted(electionId, aadharNumber);
      res.json({ hasVoted });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Candidate management routes
  app.get("/api/candidates", async (req, res) => {
    try {
      const { constituency } = req.query;
      let candidates;
      
      if (constituency) {
        candidates = await storage.getCandidatesByElection(1); // Current election
        candidates = candidates.filter(c => c.constituency === constituency);
      } else {
        candidates = await storage.getCandidatesByElection(1);
      }
      
      res.json(candidates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/candidates", upload.single('photo'), async (req, res) => {
    const adminId = (req as any).session?.adminId;
    if (!adminId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const candidateData = {
        name: req.body.name,
        party: req.body.party,
        constituency: req.body.constituency,
        symbol: req.body.symbol,
        manifesto: req.body.manifesto || null,
        electionId: parseInt(req.body.electionId) || 1,
        photoUrl: req.file ? `/uploads/${req.file.filename}` : null
      };

      // Validate required fields
      if (!candidateData.name || !candidateData.party || !candidateData.constituency || !candidateData.symbol) {
        return res.status(400).json({ message: "Name, party, constituency, and symbol are required" });
      }

      const candidate = await storage.createCandidate(candidateData);
      res.json(candidate);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/candidates/:id", upload.single('photo'), async (req, res) => {
    const adminId = (req as any).session?.adminId;
    if (!adminId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const candidateId = parseInt(req.params.id);
      const updateData: any = {};

      if (req.body.name) updateData.name = req.body.name;
      if (req.body.party) updateData.party = req.body.party;
      if (req.body.constituency) updateData.constituency = req.body.constituency;
      if (req.body.symbol) updateData.symbol = req.body.symbol;
      if (req.body.manifesto !== undefined) updateData.manifesto = req.body.manifesto || null;
      if (req.body.electionId) updateData.electionId = parseInt(req.body.electionId);

      if (req.file) {
        updateData.photoUrl = `/uploads/${req.file.filename}`;
      }

      const candidate = await storage.updateCandidate(candidateId, updateData);
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      res.json(candidate);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/candidates/:id", async (req, res) => {
    const adminId = (req as any).session?.adminId;
    if (!adminId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const candidateId = parseInt(req.params.id);
      const success = await storage.deleteCandidate(candidateId);
      
      if (!success) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      res.json({ message: "Candidate deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Election results (Admin only, after 6 PM)
  app.get("/api/elections/:electionId/results", async (req, res) => {
    try {
      // Check if user is admin
      const adminId = (req as any).session?.adminId;
      if (!adminId) {
        return res.status(401).json({ message: "Admin authentication required to view results" });
      }

      // Check if results can be viewed (after 6 PM)
      const currentHour = new Date().getHours();
      if (currentHour < 18) {
        return res.status(403).json({ 
          message: "Election results are only available after 6:00 PM",
          availableAt: "6:00 PM"
        });
      }

      const electionId = parseInt(req.params.electionId);
      const results = await storage.getElectionResults(electionId);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
