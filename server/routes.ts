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
import { db } from "./db";
import {
  loginSchema,
  insertCitizenSchema,
  verificationSchema,
  insertElectionSchema,
  insertCandidateSchema,
  voteSchema,
  voterRegistrationSchema,
  candidates
} from "@shared/schema";
import multer from "multer";
import path from "path";

// Configure multer for file uploads
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Generate unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: multerStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed'));
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

  // Death Certificate Generation
  app.post("/api/death-certificate", upload.fields([
    { name: 'medicalCertificate', maxCount: 1 },
    { name: 'aadharProof', maxCount: 1 }
  ]), async (req, res) => {
    const adminId = (req as any).session?.adminId;
    if (!adminId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const {
        aadharNumber,
        dateOfBirth,
        name,
        fatherHusbandName,
        motherName,
        gender,
        age,
        dateOfDeath,
        placeOfDeath,
        permanentAddress,
        addressAtDeath,
        remarks,
        zone,
        division
      } = req.body;

      if (!aadharNumber || !dateOfBirth) {
        return res.status(400).json({ message: "Aadhar number and Date of Birth are required" });
      }

      // Verify citizen exists
      const citizen = await storage.verifyCitizen(aadharNumber, dateOfBirth);

      if (!citizen) {
        return res.status(404).json({ message: "Citizen not found. Please verify Aadhar Number and Date of Birth." });
      }

      // Generate a registration number: YEAR/ZONE/DIVISION/RANDOM
      const year = new Date().getFullYear();
      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      const registrationNumber = `${year}/${zone}/${division}/${randomSuffix}`;

      // Create death certificate record
      const deathCert = await storage.createDeathCertificate({
        aadharNumber,
        name,
        fatherHusbandName,
        motherName,
        gender,
        age,
        dateOfDeath,
        placeOfDeath,
        permanentAddress,
        addressAtDeath,
        registrationNumber,
        dateOfRegistration: new Date().toISOString().split('T')[0],
        dateOfIssue: new Date().toISOString().split('T')[0],
        remarks: remarks || "",
        zone,
        division
      });

      // Delete citizen record
      const deleted = await storage.deleteCitizen(citizen.id);

      if (deleted) {
        res.json({
          success: true,
          message: `Death certificate generated for ${citizen.name}. Citizen record has been deleted.`,
          certificate: deathCert
        });
      } else {
        res.status(500).json({ message: "Failed to delete citizen record" });
      }

    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/death-certificates", async (req, res) => {
    const adminId = (req as any).session?.adminId;
    if (!adminId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const certificates = await storage.getAllDeathCertificates();
      res.json(certificates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
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

  // Check if date of birth exists in database (for age verification)
  app.post("/api/check-dob", async (req, res) => {
    try {
      const { dateOfBirth } = req.body;

      if (!dateOfBirth) {
        return res.status(400).json({
          exists: false,
          message: "Date of birth is required"
        });
      }

      // Check if any citizen has this date of birth
      const allCitizens = await storage.getAllCitizens();
      const citizenExists = allCitizens.some(citizen => citizen.dateOfBirth === dateOfBirth);

      res.json({
        exists: citizenExists,
        message: citizenExists
          ? "Date of birth found in records"
          : "Date of birth not found in our records"
      });
    } catch (error: any) {
      res.status(500).json({
        exists: false,
        message: error.message
      });
    }
  });

  // Public verification
  app.post("/api/verify", async (req, res) => {
    try {
      const verificationData = verificationSchema.parse(req.body);

      // First check if Aadhar number exists in database
      const citizen = await storage.getCitizenByAadhar(verificationData.aadharNumber);

      if (!citizen) {
        return res.status(404).json({
          success: false,
          message: "Aadhar number not found in our records. Please contact admin to register first."
        });
      }

      // Check if the entered date of birth matches the registered record
      if (citizen.dateOfBirth !== verificationData.dateOfBirth) {
        return res.status(400).json({
          success: false,
          message: "Date of birth does not match our records. Please enter the correct date of birth."
        });
      }

      // Calculate age to check 18+ requirement
      const birthDate = new Date(verificationData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 18) {
        return res.status(400).json({
          success: false,
          message: "You must be 18 years or older to access this portal. Current age: " + age + " years."
        });
      }

      // Verification successful - return citizen data without sensitive info
      res.json({
        success: true,
        citizen: {
          name: citizen.name,
          aadharNumber: citizen.aadharNumber,
          dateOfBirth: citizen.dateOfBirth,
          gender: citizen.gender,
          address: citizen.address,
          state: citizen.state,
          district: citizen.district,
          constituency: citizen.constituency,
          pincode: citizen.pincode,
          photoUrl: citizen.photoUrl,
          fingerprintData: citizen.fingerprintData,
          status: citizen.status,
          age: age
        }
      });
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

  // This route is handled below with file upload support

  // Voter registration
  app.post("/api/voter/register", async (req, res) => {
    try {
      const registrationData = voterRegistrationSchema.parse(req.body);
      const result = await storage.registerVoter(registrationData);
      res.status(201).json({
        success: true,
        ...result,
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

        if (registration && registration.status === "active") {
          res.json({
            eligible: true,
            message: "Voter is eligible to vote."
          });
        } else {
          res.json({
            eligible: false,
            message: "Aadhar number is not registered for voting."
          });
        }
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
      console.log('--- VOTE REQUEST RECEIVED ---');
      console.log('Body:', req.body);

      const electionId = typeof req.body.electionId === 'string' ? parseInt(req.body.electionId) : req.body.electionId;
      const candidateId = typeof req.body.candidateId === 'string' ? parseInt(req.body.candidateId) : req.body.candidateId;

      if (!electionId || !candidateId) {
        console.error('Missing electionId or candidateId');
        return res.status(400).json({ success: false, message: "Election ID and Candidate ID are required" });
      }

      // Get election timing settings
      const election = await storage.getElection(electionId);
      if (!election) {
        console.error(`Election not found: ${electionId}`);
        return res.status(404).json({ success: false, message: "Election not found" });
      }

      // Use Indian Standard Time (IST)
      const istTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
      const currentTime = new Date(istTime);
      const currentHour = currentTime.getHours();
      const currentMinute = currentTime.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;

      // Parse election timing
      const votingStartTime = election.votingStartTime || "08:00";
      const votingEndTime = election.votingEndTime || "17:00";

      const [startHour, startMin] = votingStartTime.split(':').map(Number);
      const [endHour, endMin] = votingEndTime.split(':').map(Number);

      const startTimeInMinutes = startHour * 60 + startMin;
      const endTimeInMinutes = endHour * 60 + endMin;

      console.log(`Current Time: ${currentHour}:${currentMinute} (${currentTimeInMinutes}m)`);
      console.log(`Voting Window: ${votingStartTime} - ${votingEndTime} (${startTimeInMinutes}m - ${endTimeInMinutes}m)`);

      if (currentTimeInMinutes < startTimeInMinutes || currentTimeInMinutes >= endTimeInMinutes) {
        console.error('Voting outside allowed hours');
        return res.status(403).json({
          success: false,
          message: `Voting is only allowed between ${votingStartTime} and ${votingEndTime}. Please come back during voting hours.`,
          votingHours: `${votingStartTime} - ${votingEndTime}`,
          currentTime: `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
        });
      }

      const voteData = {
        electionId,
        candidateId,
        voterAadhar: req.body.voterAadhar,
        blockchainHash: req.body.blockchainHash || null,
        transactionHash: req.body.transactionHash || null
      };

      // Check if voter is eligible
      const citizen = await storage.getCitizenByAadhar(voteData.voterAadhar);
      if (!citizen) {
        console.error(`Voter not found: ${voteData.voterAadhar}`);
        return res.status(404).json({ success: false, message: "Voter not found" });
      }

      const isEligible = await storage.isEligibleToVote(voteData.voterAadhar, citizen.dateOfBirth);
      if (!isEligible) {
        console.error('Voter not eligible');
        return res.status(403).json({ success: false, message: "Not eligible to vote" });
      }

      // Check if already voted
      const hasVoted = await storage.hasVoted(voteData.electionId, voteData.voterAadhar);
      if (hasVoted) {
        console.error('Already voted');
        return res.status(409).json({ success: false, message: "You have already voted in this election" });
      }

      // Validate blockchain proof if provided
      if (voteData.blockchainHash && !voteData.transactionHash) {
        console.error('Blockchain proof incomplete');
        return res.status(400).json({ success: false, message: "Blockchain verification incomplete" });
      }

      console.log('Casting vote in DB...');
      const vote = await storage.castVote(voteData);
      console.log('Vote cast successfully, ID:', vote.id);
      res.json({ success: true, message: "Vote cast successfully", voteId: vote.id });
    } catch (error: any) {
      console.error('Vote casting error:', error);
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
      const { constituency, electionId } = req.query;
      let candidates;

      const eid = electionId ? parseInt(electionId as string) : 1;

      if (constituency) {
        candidates = await storage.getCandidatesByElection(eid);
        candidates = candidates.filter(c => c.constituency === constituency);
      } else {
        candidates = await storage.getCandidatesByElection(eid);
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
      // Validate required fields
      if (!req.body.name || !req.body.party || !req.body.constituency || !req.body.symbol) {
        return res.status(400).json({ message: "Name, party, constituency, and symbol are required" });
      }

      // Create candidate directly in database
      const now = new Date().toISOString();
      const candidateData = {
        name: req.body.name,
        party: req.body.party,
        constituency: req.body.constituency,
        symbol: req.body.symbol,
        manifesto: req.body.manifesto || null,
        electionId: parseInt(req.body.electionId) || 1,
        photoUrl: req.file ? `/uploads/${req.file.filename}` : null,
        createdAt: now
      };

      const candidate = await storage.createCandidate(candidateData);
      res.json(candidate);
    } catch (error: any) {
      console.error('Candidate creation error:', error);
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

  // Election management routes
  app.get("/api/admin/elections", async (req, res) => {
    const adminId = (req as any).session?.adminId;
    if (!adminId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const elections = await storage.getAllElections();
      res.json(elections);
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
      const election = await storage.createElection(req.body);
      res.status(201).json(election);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/elections/:id", async (req, res) => {
    const adminId = (req as any).session?.adminId;
    if (!adminId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const electionId = parseInt(req.params.id);
      const updateData: any = {};

      if (req.body.votingStartTime) updateData.votingStartTime = req.body.votingStartTime;
      if (req.body.votingEndTime) updateData.votingEndTime = req.body.votingEndTime;
      if (req.body.resultsTime) updateData.resultsTime = req.body.resultsTime;
      if (req.body.title) updateData.title = req.body.title;
      if (req.body.description) updateData.description = req.body.description;
      if (req.body.startDate) updateData.startDate = req.body.startDate;
      if (req.body.endDate) updateData.endDate = req.body.endDate;
      if (req.body.status) updateData.status = req.body.status;
      if (req.body.blockchainAddress) updateData.blockchainAddress = req.body.blockchainAddress;

      const election = await storage.updateElection(electionId, updateData);
      if (!election) {
        return res.status(404).json({ message: "Election not found" });
      }

      res.json(election);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Election results (Admin access - always available)
  app.get("/api/elections/:electionId/results", async (req, res) => {
    try {
      // Check if user is admin
      const adminId = (req as any).session?.adminId;
      if (!adminId) {
        return res.status(401).json({ message: "Admin authentication required to view results" });
      }

      const electionId = parseInt(req.params.electionId);
      const election = await storage.getElection(electionId);

      if (!election) {
        return res.status(404).json({ message: "Election not found" });
      }

      // Admins can always view results for management purposes
      const results = await storage.getElectionResults(electionId);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Constituency-wise election results (Admin access)
  app.get("/api/elections/:electionId/constituency-results", async (req, res) => {
    try {
      // Check if user is admin
      const adminId = (req as any).session?.adminId;
      if (!adminId) {
        return res.status(401).json({ message: "Admin authentication required to view results" });
      }

      const electionId = parseInt(req.params.electionId);
      const election = await storage.getElection(electionId);

      if (!election) {
        return res.status(404).json({ message: "Election not found" });
      }

      // Get constituency-wise results
      const results = await storage.getConstituencyWiseResults(electionId);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Public election results (time-restricted for voters)
  app.get("/api/public/elections/:electionId/results", async (req, res) => {
    try {
      const electionId = parseInt(req.params.electionId);
      const election = await storage.getElection(electionId);

      if (!election) {
        return res.status(404).json({ message: "Election not found" });
      }

      // Check if results can be viewed based on election settings
      const istTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
      const currentTime = new Date(istTime);
      const currentHour = currentTime.getHours();
      const resultsHour = election.resultsTime ? parseInt(election.resultsTime.split(':')[0]) : 18;

      if (currentHour < resultsHour) {
        return res.status(403).json({
          message: `Election results are only available after ${election.resultsTime || '18:00'}`,
          availableAt: election.resultsTime || '18:00'
        });
      }

      const results = await storage.getElectionResults(electionId);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Reset sample data endpoint (Admin only)
  app.post("/api/admin/reset-sample-data", async (req, res) => {
    const adminId = (req as any).session?.adminId;
    if (!adminId) {
      return res.status(401).json({ message: "Admin authentication required" });
    }

    try {
      // Recreate candidates for all elections
      const allElections = await storage.getAllElections();

      for (const election of allElections) {
        // Delete all existing candidates for this election
        const deletedCandidates = await storage.getCandidatesByElection(election.id);
        for (const candidate of deletedCandidates) {
          await storage.deleteCandidate(candidate.id);
        }
      }

      const allConstituencies = [
        'Central Delhi', 'East Delhi', 'North Delhi', 'South Delhi', 'West Delhi',
        'Mumbai North', 'Mumbai South', 'Mumbai Central',
        'Bangalore North', 'Bangalore South', 'Bangalore Central',
        'Chennai North', 'Chennai South', 'Chennai Central',
        'Coimbatore', 'Madurai', 'Salem', 'Tiruchirapalli', 'Tirunelveli',
        'Vellore', 'Erode', 'Tiruppur', 'Dindigul', 'Thanjavur',
        'Cuddalore', 'Nagapattinam', 'Mayiladuthurai', 'Ariyalur'
      ];

      const parties = [
        { name: "National Development Party", symbol: "lotus" },
        { name: "Progressive Alliance", symbol: "hand" },
        { name: "Common Man's Party", symbol: "broom" },
        { name: "Revolutionary Front", symbol: "hammer" },
        { name: "Regional People's Party", symbol: "bicycle" }
      ];

      const candidateNames = [
        "Dr. Amit Singh", "Ms. Priya Venkatesh", "Shri Rajesh Kumar",
        "Ms. Kavitha Nair", "Dr. Murugan Selvam", "Shri Arjun Pandey",
        "Shri Ravi Patel", "Ms. Deepa Krishnan", "Dr. Sundar Raman",
        "Ms. Lakshmi Devi", "Shri Karthik Subramanian", "Dr. Anitha Kumari",
        "Shri Ganesh Babu", "Ms. Meera Krishnamurthy", "Dr. Venkatesh Iyer",
        "Ms. Sita Ramachandran", "Shri Vikram Sharma", "Dr. Rekha Agarwal",
        "Shri Manoj Tiwari", "Ms. Nandini Reddy", "Dr. Suresh Pillai",
        "Ms. Geeta Mathur", "Shri Arun Kumar", "Dr. Pooja Sinha",
        "Shri Rahul Gupta", "Ms. Divya Krishnan", "Dr. Ashok Mehta",
        "Ms. Sunitha Rao", "Shri Praveen Nair", "Dr. Manjula Devi"
      ];

      const manifestos = [
        "Economic growth and infrastructure development",
        "Healthcare reform and education enhancement",
        "Environmental protection and sustainable development",
        "Social justice and rural development",
        "Anti-corruption and digital governance",
        "Women empowerment and small business support",
        "Agricultural modernization and farmer welfare",
        "Industrial development and job creation",
        "Workers' rights and labor welfare",
        "Urban development and smart city initiatives"
      ];

      // Create 3 candidates per constituency for EACH election
      let totalCreated = 0;
      for (const election of allElections) {
        let candidateIndex = 0;
        for (const constituency of allConstituencies) {
          for (let i = 0; i < 3; i++) {
            const party = parties[i % parties.length];
            const name = candidateNames[candidateIndex % candidateNames.length];
            const manifesto = manifestos[candidateIndex % manifestos.length];

            await storage.createCandidate({
              electionId: election.id,
              name: `${name} (${constituency.split(' ')[0]})`,
              party: party.name,
              constituency,
              symbol: party.symbol,
              manifesto
            });

            candidateIndex++;
            totalCreated++;
          }
        }
      }

      res.json({
        success: true,
        message: `Sample data reset successfully. Created ${totalCreated} candidates across ${allElections.length} elections.`
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
