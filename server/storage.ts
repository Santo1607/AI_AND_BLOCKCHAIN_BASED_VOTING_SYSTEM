import { 
  admins, 
  citizens, 
  elections,
  candidates,
  votes,
  voterRegistrations,
  type Admin, 
  type InsertAdmin, 
  type Citizen, 
  type InsertCitizen,
  type Election,
  type InsertElection,
  type Candidate,
  type InsertCandidate,
  type Vote,
  type VoteData,
  type VoterRegistration,
  type VoterRegistrationData
} from "@shared/schema";

export interface IStorage {
  // Admin methods
  getAdmin(id: number): Promise<Admin | undefined>;
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  
  // Citizen methods
  getCitizen(id: number): Promise<Citizen | undefined>;
  getCitizenByAadhar(aadharNumber: string): Promise<Citizen | undefined>;
  getAllCitizens(): Promise<Citizen[]>;
  searchCitizens(query: string, district?: string, gender?: string): Promise<Citizen[]>;
  createCitizen(citizen: InsertCitizen): Promise<Citizen>;
  updateCitizen(id: number, citizen: Partial<InsertCitizen>): Promise<Citizen | undefined>;
  deleteCitizen(id: number): Promise<boolean>;
  verifyCitizen(aadharNumber: string, dateOfBirth: string): Promise<Citizen | undefined>;
  
  // Election methods
  getAllElections(): Promise<Election[]>;
  getElection(id: number): Promise<Election | undefined>;
  createElection(election: InsertElection): Promise<Election>;
  updateElection(id: number, election: Partial<InsertElection>): Promise<Election | undefined>;
  deleteElection(id: number): Promise<boolean>;
  
  // Candidate methods
  getCandidatesByElection(electionId: number): Promise<Candidate[]>;
  getCandidate(id: number): Promise<Candidate | undefined>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  updateCandidate(id: number, candidate: Partial<InsertCandidate>): Promise<Candidate | undefined>;
  deleteCandidate(id: number): Promise<boolean>;
  
  // Voting methods
  castVote(voteData: VoteData): Promise<Vote>;
  hasVoted(electionId: number, voterAadhar: string): Promise<boolean>;
  getVotesByElection(electionId: number): Promise<Vote[]>;
  getElectionResults(electionId: number): Promise<{ candidateId: number; candidateName: string; party: string; voteCount: number }[]>;
  
  // Voter registration methods
  registerVoter(registrationData: VoterRegistrationData): Promise<VoterRegistration>;
  getVoterRegistration(aadharNumber: string): Promise<VoterRegistration | undefined>;
  isEligibleToVote(aadharNumber: string, dateOfBirth: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private admins: Map<number, Admin>;
  private citizens: Map<number, Citizen>;
  private elections: Map<number, Election>;
  private candidates: Map<number, Candidate>;
  private votes: Map<number, Vote>;
  private voterRegistrations: Map<number, VoterRegistration>;
  private adminIdCounter: number;
  private citizenIdCounter: number;
  private electionIdCounter: number;
  private candidateIdCounter: number;
  private voteIdCounter: number;
  private voterRegistrationIdCounter: number;

  constructor() {
    this.admins = new Map();
    this.citizens = new Map();
    this.elections = new Map();
    this.candidates = new Map();
    this.votes = new Map();
    this.voterRegistrations = new Map();
    this.adminIdCounter = 1;
    this.citizenIdCounter = 1;
    this.electionIdCounter = 1;
    this.candidateIdCounter = 1;
    this.voteIdCounter = 1;
    this.voterRegistrationIdCounter = 1;

    // Create default admin user
    this.createAdmin({
      username: "admin123",
      password: "admin@123",
      name: "System Administrator"
    });

    // Create some sample citizens for demo
    this.createCitizen({
      name: "Rajesh Kumar",
      aadharNumber: "1234-5678-9012",
      dateOfBirth: "1985-08-15",
      gender: "male",
      address: "123 Main Street, Andheri West",
      district: "Mumbai",
      pincode: "400058"
    });

    this.createCitizen({
      name: "Priya Sharma",
      aadharNumber: "9876-5432-1098",
      dateOfBirth: "1992-03-22",
      gender: "female",
      address: "456 Central Avenue, Karol Bagh",
      district: "Delhi",
      pincode: "110005"
    });

    // Initialize sample data after all maps are created
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    // Create sample election
    const election = await this.createElection({
      title: "General Election 2024",
      description: "National Parliamentary Election",
      startDate: "2024-04-01",
      endDate: "2024-04-07",
      status: "active"
    });

    // Create candidates for the election
    await this.createCandidate({
      electionId: election.id,
      name: "Dr. Amit Singh",
      party: "National Development Party",
      symbol: "lotus",
      manifesto: "Economic growth, healthcare reform, and education enhancement"
    });

    await this.createCandidate({
      electionId: election.id,
      name: "Ms. Kavitha Nair",
      party: "Progressive Alliance",
      symbol: "hand",
      manifesto: "Social justice, environmental protection, and rural development"
    });

    await this.createCandidate({
      electionId: election.id,
      name: "Shri Ravi Patel",
      party: "Common Man's Party",
      symbol: "broom",
      manifesto: "Anti-corruption, transparency, and citizen empowerment"
    });

    // Register sample voters
    await this.registerVoter({
      aadharNumber: "1234-5678-9012",
      dateOfBirth: "1985-08-15"
    });

    await this.registerVoter({
      aadharNumber: "9876-5432-1098",
      dateOfBirth: "1992-03-22"
    });
  }

  // Admin methods
  async getAdmin(id: number): Promise<Admin | undefined> {
    return this.admins.get(id);
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find(
      (admin) => admin.username === username
    );
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const id = this.adminIdCounter++;
    const admin: Admin = { 
      ...insertAdmin, 
      id,
      isActive: true
    };
    this.admins.set(id, admin);
    return admin;
  }

  // Citizen methods
  async getCitizen(id: number): Promise<Citizen | undefined> {
    return this.citizens.get(id);
  }

  async getCitizenByAadhar(aadharNumber: string): Promise<Citizen | undefined> {
    return Array.from(this.citizens.values()).find(
      (citizen) => citizen.aadharNumber === aadharNumber
    );
  }

  async getAllCitizens(): Promise<Citizen[]> {
    return Array.from(this.citizens.values());
  }

  async searchCitizens(query: string, district?: string, gender?: string): Promise<Citizen[]> {
    let results = Array.from(this.citizens.values());

    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(
        (citizen) => 
          citizen.name.toLowerCase().includes(lowerQuery) ||
          citizen.aadharNumber.includes(query)
      );
    }

    if (district) {
      results = results.filter((citizen) => citizen.district === district);
    }

    if (gender) {
      results = results.filter((citizen) => citizen.gender === gender);
    }

    return results;
  }

  async createCitizen(insertCitizen: InsertCitizen): Promise<Citizen> {
    const id = this.citizenIdCounter++;
    const now = new Date().toISOString();
    const citizen: Citizen = { 
      id,
      name: insertCitizen.name,
      aadharNumber: insertCitizen.aadharNumber,
      dateOfBirth: insertCitizen.dateOfBirth,
      gender: insertCitizen.gender,
      address: insertCitizen.address,
      district: insertCitizen.district,
      pincode: insertCitizen.pincode,
      photoUrl: insertCitizen.photoUrl || null,
      status: "active",
      createdAt: now,
      updatedAt: now
    };
    this.citizens.set(id, citizen);
    return citizen;
  }

  async updateCitizen(id: number, updateData: Partial<InsertCitizen>): Promise<Citizen | undefined> {
    const citizen = this.citizens.get(id);
    if (!citizen) return undefined;

    const updatedCitizen: Citizen = {
      ...citizen,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    this.citizens.set(id, updatedCitizen);
    return updatedCitizen;
  }

  async deleteCitizen(id: number): Promise<boolean> {
    return this.citizens.delete(id);
  }

  async verifyCitizen(aadharNumber: string, dateOfBirth: string): Promise<Citizen | undefined> {
    const citizen = await this.getCitizenByAadhar(aadharNumber);
    if (citizen && citizen.dateOfBirth === dateOfBirth) {
      return citizen;
    }
    return undefined;
  }

  // Election methods
  async getAllElections(): Promise<Election[]> {
    return Array.from(this.elections.values());
  }

  async getElection(id: number): Promise<Election | undefined> {
    return this.elections.get(id);
  }

  async createElection(insertElection: InsertElection): Promise<Election> {
    const id = this.electionIdCounter++;
    const now = new Date().toISOString();
    const election: Election = {
      id,
      title: insertElection.title,
      description: insertElection.description,
      startDate: insertElection.startDate,
      endDate: insertElection.endDate,
      status: insertElection.status || "upcoming",
      createdAt: now,
      updatedAt: now
    };
    this.elections.set(id, election);
    return election;
  }

  async updateElection(id: number, updateData: Partial<InsertElection>): Promise<Election | undefined> {
    const election = this.elections.get(id);
    if (!election) return undefined;

    const updatedElection: Election = {
      ...election,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    this.elections.set(id, updatedElection);
    return updatedElection;
  }

  async deleteElection(id: number): Promise<boolean> {
    return this.elections.delete(id);
  }

  // Candidate methods
  async getCandidatesByElection(electionId: number): Promise<Candidate[]> {
    return Array.from(this.candidates.values()).filter(
      candidate => candidate.electionId === electionId
    );
  }

  async getCandidate(id: number): Promise<Candidate | undefined> {
    return this.candidates.get(id);
  }

  async createCandidate(insertCandidate: InsertCandidate): Promise<Candidate> {
    const id = this.candidateIdCounter++;
    const now = new Date().toISOString();
    const candidate: Candidate = {
      id,
      electionId: insertCandidate.electionId,
      name: insertCandidate.name,
      party: insertCandidate.party,
      symbol: insertCandidate.symbol,
      photoUrl: insertCandidate.photoUrl || null,
      manifesto: insertCandidate.manifesto || null,
      createdAt: now
    };
    this.candidates.set(id, candidate);
    return candidate;
  }

  async updateCandidate(id: number, updateData: Partial<InsertCandidate>): Promise<Candidate | undefined> {
    const candidate = this.candidates.get(id);
    if (!candidate) return undefined;

    const updatedCandidate: Candidate = {
      ...candidate,
      ...updateData
    };
    
    this.candidates.set(id, updatedCandidate);
    return updatedCandidate;
  }

  async deleteCandidate(id: number): Promise<boolean> {
    return this.candidates.delete(id);
  }

  // Voting methods
  async castVote(voteData: VoteData): Promise<Vote> {
    const id = this.voteIdCounter++;
    const now = new Date().toISOString();
    const vote: Vote = {
      id,
      electionId: voteData.electionId,
      candidateId: voteData.candidateId,
      voterAadhar: voteData.voterAadhar,
      votedAt: now
    };
    this.votes.set(id, vote);
    return vote;
  }

  async hasVoted(electionId: number, voterAadhar: string): Promise<boolean> {
    return Array.from(this.votes.values()).some(
      vote => vote.electionId === electionId && vote.voterAadhar === voterAadhar
    );
  }

  async getVotesByElection(electionId: number): Promise<Vote[]> {
    return Array.from(this.votes.values()).filter(
      vote => vote.electionId === electionId
    );
  }

  async getElectionResults(electionId: number): Promise<{ candidateId: number; candidateName: string; party: string; voteCount: number }[]> {
    const votes = await this.getVotesByElection(electionId);
    const candidates = await this.getCandidatesByElection(electionId);
    
    const voteCounts = new Map<number, number>();
    votes.forEach(vote => {
      const count = voteCounts.get(vote.candidateId) || 0;
      voteCounts.set(vote.candidateId, count + 1);
    });

    return candidates.map(candidate => ({
      candidateId: candidate.id,
      candidateName: candidate.name,
      party: candidate.party,
      voteCount: voteCounts.get(candidate.id) || 0
    })).sort((a, b) => b.voteCount - a.voteCount);
  }

  // Voter registration methods
  async registerVoter(registrationData: VoterRegistrationData): Promise<VoterRegistration> {
    const citizen = await this.verifyCitizen(registrationData.aadharNumber, registrationData.dateOfBirth);
    if (!citizen) {
      throw new Error("Citizen verification failed. Please check your Aadhar number and date of birth.");
    }

    // Check if already registered
    const existingRegistration = await this.getVoterRegistration(registrationData.aadharNumber);
    if (existingRegistration) {
      throw new Error("This Aadhar number is already registered as a voter.");
    }

    const id = this.voterRegistrationIdCounter++;
    const now = new Date().toISOString();
    const voterIdNumber = `VID${Date.now()}${id}`;
    
    const registration: VoterRegistration = {
      id,
      citizenId: citizen.id,
      voterIdNumber,
      registeredAt: now,
      status: "active"
    };
    
    this.voterRegistrations.set(id, registration);
    return registration;
  }

  async getVoterRegistration(aadharNumber: string): Promise<VoterRegistration | undefined> {
    const citizen = await this.getCitizenByAadhar(aadharNumber);
    if (!citizen) return undefined;

    return Array.from(this.voterRegistrations.values()).find(
      registration => registration.citizenId === citizen.id
    );
  }

  async isEligibleToVote(aadharNumber: string, dateOfBirth: string): Promise<boolean> {
    const citizen = await this.verifyCitizen(aadharNumber, dateOfBirth);
    if (!citizen) return false;

    const registration = await this.getVoterRegistration(aadharNumber);
    return registration?.status === "active";
  }
}

export const storage = new MemStorage();
