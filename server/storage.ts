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
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

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
  getConstituencyWiseResults(electionId: number): Promise<{
    constituencyResults: { [constituency: string]: { candidateId: number; candidateName: string; party: string; constituency: string; voteCount: number; isWinner: boolean }[] };
    overallWinner: { candidateId: number; candidateName: string; party: string; totalVotes: number; constituenciesWon: number } | null;
    totalVotes: number;
  }>;
  
  // Voter registration methods
  registerVoter(registrationData: VoterRegistrationData): Promise<VoterRegistration>;
  getVoterRegistration(aadharNumber: string): Promise<VoterRegistration | undefined>;
  isEligibleToVote(aadharNumber: string, dateOfBirth: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    try {
      // Check if admin already exists
      const existingAdmin = await this.getAdminByUsername("admin123");
      if (!existingAdmin) {
        // Create default admin user
        await this.createAdmin({
          username: "admin123",
          password: "admin@123",
          name: "System Administrator"
        });
      }

      // Check if sample citizens exist
      const existingCitizen = await this.getCitizenByAadhar("1234-5678-9012");
      if (!existingCitizen) {
        // Create sample citizens
        await this.createCitizen({
          name: "Rajesh Kumar",
          aadharNumber: "1234-5678-9012",
          dateOfBirth: "1985-08-15",
          gender: "male",
          address: "123 Main Street, Andheri West",
          district: "Mumbai",
          constituency: "Chennai Central",
          pincode: "400058"
        });

        await this.createCitizen({
          name: "Priya Sharma",
          aadharNumber: "9876-5432-1098",
          dateOfBirth: "1992-03-22",
          gender: "female",
          address: "456 Central Avenue, Karol Bagh",
          district: "Delhi",
          constituency: "Madurai",
          pincode: "110005"
        });
      }

      // Check if sample election exists
      const existingElections = await this.getAllElections();
      if (existingElections.length === 0) {
        // Create sample election
        const election = await this.createElection({
          title: "General Election 2024",
          description: "National Parliamentary Election",
          startDate: "2024-04-01",
          endDate: "2024-04-07",
          status: "active"
        });

        // Create candidates for the election across multiple constituencies
        
        // Chennai Central Constituency
        await this.createCandidate({
          electionId: election.id,
          name: "Dr. Amit Singh",
          party: "National Development Party",
          constituency: "Chennai Central",
          symbol: "lotus",
          manifesto: "Economic growth, healthcare reform, and education enhancement"
        });

        await this.createCandidate({
          electionId: election.id,
          name: "Ms. Priya Venkatesh",
          party: "Progressive Alliance",
          constituency: "Chennai Central",
          symbol: "hand",
          manifesto: "Urban development and infrastructure improvement"
        });

        await this.createCandidate({
          electionId: election.id,
          name: "Shri Rajesh Kumar",
          party: "Common Man's Party",
          constituency: "Chennai Central",
          symbol: "broom",
          manifesto: "Anti-corruption and digital governance"
        });

        // Madurai Constituency
        await this.createCandidate({
          electionId: election.id,
          name: "Ms. Kavitha Nair",
          party: "Progressive Alliance",
          constituency: "Madurai",
          symbol: "hand",
          manifesto: "Social justice, environmental protection, and rural development"
        });

        await this.createCandidate({
          electionId: election.id,
          name: "Dr. Murugan Selvam",
          party: "National Development Party",
          constituency: "Madurai",
          symbol: "lotus",
          manifesto: "Agricultural modernization and farmer welfare"
        });

        await this.createCandidate({
          electionId: election.id,
          name: "Shri Arjun Pandey",
          party: "Revolutionary Front",
          constituency: "Madurai",
          symbol: "hammer",
          manifesto: "Workers' rights and industrial development"
        });

        // Coimbatore Constituency
        await this.createCandidate({
          electionId: election.id,
          name: "Shri Ravi Patel",
          party: "Common Man's Party",
          constituency: "Coimbatore",
          symbol: "broom",
          manifesto: "Anti-corruption, transparency, and citizen empowerment"
        });

        await this.createCandidate({
          electionId: election.id,
          name: "Ms. Deepa Krishnan",
          party: "National Development Party",
          constituency: "Coimbatore",
          symbol: "lotus",
          manifesto: "Textile industry growth and job creation"
        });

        await this.createCandidate({
          electionId: election.id,
          name: "Dr. Sundar Raman",
          party: "Progressive Alliance",
          constituency: "Coimbatore",
          symbol: "hand",
          manifesto: "Healthcare accessibility and education reform"
        });

        // Tiruppur Constituency
        await this.createCandidate({
          electionId: election.id,
          name: "Ms. Lakshmi Devi",
          party: "Regional People's Party",
          constituency: "Tiruppur",
          symbol: "bicycle",
          manifesto: "Women empowerment and small business support"
        });

        await this.createCandidate({
          electionId: election.id,
          name: "Shri Karthik Subramanian",
          party: "National Development Party",
          constituency: "Tiruppur",
          symbol: "lotus",
          manifesto: "Export promotion and industrial growth"
        });

        await this.createCandidate({
          electionId: election.id,
          name: "Dr. Anitha Kumari",
          party: "Progressive Alliance",
          constituency: "Tiruppur",
          symbol: "hand",
          manifesto: "Environmental conservation and sustainable development"
        });

        // Salem Constituency
        await this.createCandidate({
          electionId: election.id,
          name: "Shri Ganesh Babu",
          party: "Common Man's Party",
          constituency: "Salem",
          symbol: "broom",
          manifesto: "Clean governance and infrastructure development"
        });

        await this.createCandidate({
          electionId: election.id,
          name: "Ms. Meera Krishnamurthy",
          party: "National Development Party",
          constituency: "Salem",
          symbol: "lotus",
          manifesto: "Steel industry modernization and employment"
        });

        await this.createCandidate({
          electionId: election.id,
          name: "Dr. Venkatesh Iyer",
          party: "Revolutionary Front",
          constituency: "Salem",
          symbol: "hammer",
          manifesto: "Labor welfare and industrial safety"
        });

        // Register sample voters
        try {
          await this.registerVoter({
            aadharNumber: "1234-5678-9012",
            dateOfBirth: "1985-08-15"
          });

          await this.registerVoter({
            aadharNumber: "9876-5432-1098",
            dateOfBirth: "1992-03-22"
          });
        } catch (error) {
          // Voters might already be registered, ignore error
        }
      }
    } catch (error) {
      console.error("Error initializing sample data:", error);
    }
  }

  // Admin methods
  async getAdmin(id: number): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.id, id));
    return admin || undefined;
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));
    return admin || undefined;
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const [admin] = await db
      .insert(admins)
      .values(insertAdmin)
      .returning();
    return admin;
  }

  // Citizen methods
  async getCitizen(id: number): Promise<Citizen | undefined> {
    const [citizen] = await db.select().from(citizens).where(eq(citizens.id, id));
    return citizen || undefined;
  }

  async getCitizenByAadhar(aadharNumber: string): Promise<Citizen | undefined> {
    const [citizen] = await db.select().from(citizens).where(eq(citizens.aadharNumber, aadharNumber));
    return citizen || undefined;
  }

  async getAllCitizens(): Promise<Citizen[]> {
    return await db.select().from(citizens);
  }

  async searchCitizens(query: string, district?: string, gender?: string): Promise<Citizen[]> {
    let queryBuilder = db.select().from(citizens);
    
    const conditions = [];
    
    if (query) {
      conditions.push(
        sql`${citizens.name} ILIKE ${'%' + query + '%'} OR ${citizens.aadharNumber} LIKE ${'%' + query + '%'}`
      );
    }
    
    if (district) {
      conditions.push(eq(citizens.district, district));
    }
    
    if (gender) {
      conditions.push(eq(citizens.gender, gender));
    }
    
    if (conditions.length > 0) {
      queryBuilder = queryBuilder.where(
        conditions.length === 1 ? conditions[0] : and(...conditions)
      );
    }
    
    return await queryBuilder;
  }

  async createCitizen(insertCitizen: InsertCitizen): Promise<Citizen> {
    const now = new Date().toISOString();
    const [citizen] = await db
      .insert(citizens)
      .values({
        ...insertCitizen,
        status: "active",
        createdAt: now,
        updatedAt: now
      })
      .returning();
    return citizen;
  }

  async updateCitizen(id: number, updateData: Partial<InsertCitizen>): Promise<Citizen | undefined> {
    const [citizen] = await db
      .update(citizens)
      .set({
        ...updateData,
        updatedAt: new Date().toISOString()
      })
      .where(eq(citizens.id, id))
      .returning();
    return citizen || undefined;
  }

  async deleteCitizen(id: number): Promise<boolean> {
    const result = await db.delete(citizens).where(eq(citizens.id, id));
    return (result.rowCount || 0) > 0;
  }

  async verifyCitizen(aadharNumber: string, dateOfBirth: string): Promise<Citizen | undefined> {
    const [citizen] = await db
      .select()
      .from(citizens)
      .where(and(
        eq(citizens.aadharNumber, aadharNumber),
        eq(citizens.dateOfBirth, dateOfBirth)
      ));
    return citizen || undefined;
  }

  // Election methods
  async getAllElections(): Promise<Election[]> {
    return await db.select().from(elections);
  }

  async getElection(id: number): Promise<Election | undefined> {
    const [election] = await db.select().from(elections).where(eq(elections.id, id));
    return election || undefined;
  }

  async createElection(insertElection: InsertElection): Promise<Election> {
    const now = new Date().toISOString();
    const [election] = await db
      .insert(elections)
      .values({
        ...insertElection,
        status: insertElection.status || "upcoming",
        createdAt: now,
        updatedAt: now
      })
      .returning();
    return election;
  }

  async updateElection(id: number, updateData: Partial<InsertElection>): Promise<Election | undefined> {
    const [election] = await db
      .update(elections)
      .set({
        ...updateData,
        updatedAt: new Date().toISOString()
      })
      .where(eq(elections.id, id))
      .returning();
    return election || undefined;
  }

  async deleteElection(id: number): Promise<boolean> {
    const result = await db.delete(elections).where(eq(elections.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Candidate methods
  async getCandidatesByElection(electionId: number): Promise<Candidate[]> {
    return await db.select().from(candidates).where(eq(candidates.electionId, electionId));
  }

  async getCandidate(id: number): Promise<Candidate | undefined> {
    const [candidate] = await db.select().from(candidates).where(eq(candidates.id, id));
    return candidate || undefined;
  }

  async createCandidate(candidateData: any): Promise<Candidate> {
    const now = new Date().toISOString();
    const [candidate] = await db
      .insert(candidates)
      .values({
        name: candidateData.name,
        party: candidateData.party,
        constituency: candidateData.constituency,
        symbol: candidateData.symbol,
        manifesto: candidateData.manifesto,
        electionId: candidateData.electionId,
        photoUrl: candidateData.photoUrl,
        createdAt: candidateData.createdAt || now
      })
      .returning();
    return candidate;
  }

  async updateCandidate(id: number, updateData: Partial<InsertCandidate>): Promise<Candidate | undefined> {
    const [candidate] = await db
      .update(candidates)
      .set(updateData)
      .where(eq(candidates.id, id))
      .returning();
    return candidate || undefined;
  }

  async deleteCandidate(id: number): Promise<boolean> {
    const result = await db.delete(candidates).where(eq(candidates.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Voting methods
  async castVote(voteData: VoteData): Promise<Vote> {
    const now = new Date().toISOString();
    const [vote] = await db
      .insert(votes)
      .values({
        electionId: voteData.electionId,
        candidateId: voteData.candidateId,
        voterAadhar: voteData.voterAadhar,
        blockchainHash: voteData.blockchainHash,
        transactionHash: voteData.transactionHash,
        votedAt: now
      })
      .returning();
    return vote;
  }

  async hasVoted(electionId: number, voterAadhar: string): Promise<boolean> {
    const [vote] = await db
      .select()
      .from(votes)
      .where(and(
        eq(votes.electionId, electionId),
        eq(votes.voterAadhar, voterAadhar)
      ));
    return !!vote;
  }

  async getVotesByElection(electionId: number): Promise<Vote[]> {
    return await db.select().from(votes).where(eq(votes.electionId, electionId));
  }

  async getElectionResults(electionId: number): Promise<{ candidateId: number; candidateName: string; party: string; voteCount: number }[]> {
    const electionVotes = await this.getVotesByElection(electionId);
    const electionCandidates = await this.getCandidatesByElection(electionId);
    
    const voteCounts = new Map<number, number>();
    electionVotes.forEach(vote => {
      const count = voteCounts.get(vote.candidateId) || 0;
      voteCounts.set(vote.candidateId, count + 1);
    });

    return electionCandidates.map(candidate => ({
      candidateId: candidate.id,
      candidateName: candidate.name,
      party: candidate.party,
      voteCount: voteCounts.get(candidate.id) || 0
    })).sort((a, b) => b.voteCount - a.voteCount);
  }

  async getConstituencyWiseResults(electionId: number): Promise<{
    constituencyResults: { [constituency: string]: { candidateId: number; candidateName: string; party: string; constituency: string; voteCount: number; isWinner: boolean }[] };
    overallWinner: { candidateId: number; candidateName: string; party: string; totalVotes: number; constituenciesWon: number } | null;
    totalVotes: number;
  }> {
    const electionVotes = await this.getVotesByElection(electionId);
    const electionCandidates = await this.getCandidatesByElection(electionId);
    
    // Group candidates by constituency
    const candidatesByConstituency = new Map<string, Candidate[]>();
    electionCandidates.forEach(candidate => {
      if (!candidatesByConstituency.has(candidate.constituency)) {
        candidatesByConstituency.set(candidate.constituency, []);
      }
      candidatesByConstituency.get(candidate.constituency)!.push(candidate);
    });

    // Count votes for each candidate
    const voteCounts = new Map<number, number>();
    electionVotes.forEach(vote => {
      const count = voteCounts.get(vote.candidateId) || 0;
      voteCounts.set(vote.candidateId, count + 1);
    });

    // Calculate constituency-wise results
    const constituencyResults: { [constituency: string]: any[] } = {};
    const constituencyWinners = new Map<string, { candidateId: number; candidateName: string; party: string; voteCount: number }>();

    candidatesByConstituency.forEach((candidates, constituency) => {
      const results = candidates.map(candidate => ({
        candidateId: candidate.id,
        candidateName: candidate.name,
        party: candidate.party,
        constituency: candidate.constituency,
        voteCount: voteCounts.get(candidate.id) || 0,
        isWinner: false
      })).sort((a, b) => b.voteCount - a.voteCount);

      // Mark the winner in each constituency
      if (results.length > 0 && results[0].voteCount > 0) {
        results[0].isWinner = true;
        constituencyWinners.set(constituency, {
          candidateId: results[0].candidateId,
          candidateName: results[0].candidateName,
          party: results[0].party,
          voteCount: results[0].voteCount
        });
      }

      constituencyResults[constituency] = results;
    });

    // Calculate overall winner based on constituencies won
    let overallWinner = null;
    if (constituencyWinners.size > 0) {
      const partyWins = new Map<string, { count: number; totalVotes: number; candidateInfo: any }>();
      
      constituencyWinners.forEach(winner => {
        if (!partyWins.has(winner.party)) {
          partyWins.set(winner.party, { count: 0, totalVotes: 0, candidateInfo: winner });
        }
        const partyData = partyWins.get(winner.party)!;
        partyData.count += 1;
        partyData.totalVotes += winner.voteCount;
      });

      // Find party with most constituency wins
      let maxWins = 0;
      let winningParty = '';
      partyWins.forEach((data, party) => {
        if (data.count > maxWins) {
          maxWins = data.count;
          winningParty = party;
        }
      });

      if (winningParty) {
        const winnerData = partyWins.get(winningParty)!;
        overallWinner = {
          candidateId: winnerData.candidateInfo.candidateId,
          candidateName: winnerData.candidateInfo.candidateName,
          party: winningParty,
          totalVotes: winnerData.totalVotes,
          constituenciesWon: winnerData.count
        };
      }
    }

    return {
      constituencyResults,
      overallWinner,
      totalVotes: electionVotes.length
    };
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

    const now = new Date().toISOString();
    const voterIdNumber = `VID${Date.now()}${citizen.id}`;
    
    const [registration] = await db
      .insert(voterRegistrations)
      .values({
        citizenId: citizen.id,
        voterIdNumber,
        registeredAt: now,
        status: "active"
      })
      .returning();
    
    return registration;
  }

  async getVoterRegistration(aadharNumber: string): Promise<VoterRegistration | undefined> {
    const citizen = await this.getCitizenByAadhar(aadharNumber);
    if (!citizen) return undefined;

    const [registration] = await db
      .select()
      .from(voterRegistrations)
      .where(eq(voterRegistrations.citizenId, citizen.id));
    
    return registration || undefined;
  }

  async isEligibleToVote(aadharNumber: string, dateOfBirth: string): Promise<boolean> {
    const citizen = await this.verifyCitizen(aadharNumber, dateOfBirth);
    if (!citizen) return false;

    const registration = await this.getVoterRegistration(aadharNumber);
    return registration?.status === "active";
  }
}

export const storage = new DatabaseStorage();
