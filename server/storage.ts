import { 
  admins, 
  citizens, 
  type Admin, 
  type InsertAdmin, 
  type Citizen, 
  type InsertCitizen 
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
}

export class MemStorage implements IStorage {
  private admins: Map<number, Admin>;
  private citizens: Map<number, Citizen>;
  private adminIdCounter: number;
  private citizenIdCounter: number;

  constructor() {
    this.admins = new Map();
    this.citizens = new Map();
    this.adminIdCounter = 1;
    this.citizenIdCounter = 1;

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
      ...insertCitizen, 
      id,
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
}

export const storage = new MemStorage();
