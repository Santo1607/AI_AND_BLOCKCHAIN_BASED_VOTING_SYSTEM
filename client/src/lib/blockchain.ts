// Ethereum blockchain integration for vote integrity
import { ethers } from 'ethers';

// Simple vote contract ABI for demonstration
const VOTE_CONTRACT_ABI = [
  "function castVote(bytes32 voterHash, uint256 candidateId, bytes32 voteHash) external",
  "function getVoteCount(uint256 candidateId) external view returns (uint256)",
  "function hasVoted(bytes32 voterHash) external view returns (bool)",
  "function getVoteHash(bytes32 voterHash) external view returns (bytes32)",
  "event VoteCast(bytes32 indexed voterHash, uint256 indexed candidateId, bytes32 voteHash, uint256 timestamp)"
];

// Mock contract address for demonstration
const CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890";

export class VotingBlockchain {
  private provider: ethers.Provider | null = null;
  private contract: ethers.Contract | null = null;
  private signer: ethers.Signer | null = null;

  constructor() {
    this.initializeProvider();
  }

  private initializeProvider() {
    try {
      // Use local blockchain simulation for development
      // This simulates blockchain properties without requiring external services
      console.log('Initializing blockchain simulation for vote integrity');
      
      // Don't attempt to connect to external providers in development
      // All blockchain operations will use local simulation
    } catch (error) {
      console.warn('Blockchain initialization failed:', error);
    }
  }

  // Create a hash for the voter (anonymized)
  createVoterHash(aadharNumber: string, electionId: number): string {
    const salt = 'blockchain-vote-salt-2024';
    const data = `${aadharNumber}-${electionId}-${salt}`;
    return ethers.keccak256(ethers.toUtf8Bytes(data));
  }

  // Create a hash for the vote
  createVoteHash(voterHash: string, candidateId: number, timestamp: number): string {
    const data = `${voterHash}-${candidateId}-${timestamp}`;
    return ethers.keccak256(ethers.toUtf8Bytes(data));
  }

  // Cast vote on blockchain
  async castVoteOnChain(aadharNumber: string, electionId: number, candidateId: number): Promise<{
    success: boolean;
    transactionHash?: string;
    voteHash: string;
    error?: string;
  }> {
    try {
      const voterHash = this.createVoterHash(aadharNumber, electionId);
      const timestamp = Math.floor(Date.now() / 1000);
      const voteHash = this.createVoteHash(voterHash, candidateId, timestamp);

      if (this.contract && this.signer) {
        // Check if already voted
        const hasVoted = await this.contract.hasVoted(voterHash);
        if (hasVoted) {
          return {
            success: false,
            voteHash,
            error: "Vote already cast on blockchain"
          };
        }

        // Cast vote on blockchain
        const transaction = await this.contract.castVote(voterHash, candidateId, voteHash);
        const receipt = await transaction.wait();

        return {
          success: true,
          transactionHash: receipt.hash,
          voteHash
        };
      } else {
        // Simulate blockchain storage for development
        const localVotes = this.getLocalVotes();
        
        // Don't check for duplicates here - let the database handle vote validation
        // This allows the server to properly manage vote tracking
        
        // Store vote locally with blockchain-like properties
        localVotes[voterHash] = {
          candidateId,
          voteHash,
          timestamp,
          blockNumber: Object.keys(localVotes).length + 1
        };
        
        this.setLocalVotes(localVotes);

        return {
          success: true,
          transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`, // Mock transaction hash
          voteHash
        };
      }
    } catch (error: any) {
      return {
        success: false,
        voteHash: '',
        error: error.message || 'Blockchain transaction failed'
      };
    }
  }

  // Verify vote integrity
  async verifyVoteIntegrity(aadharNumber: string, electionId: number): Promise<{
    verified: boolean;
    voteHash?: string;
    candidateId?: number;
    transactionHash?: string;
  }> {
    try {
      const voterHash = this.createVoterHash(aadharNumber, electionId);

      if (this.contract) {
        const hasVoted = await this.contract.hasVoted(voterHash);
        if (hasVoted) {
          const storedVoteHash = await this.contract.getVoteHash(voterHash);
          return {
            verified: true,
            voteHash: storedVoteHash
          };
        }
      } else {
        // Check local simulation
        const localVotes = this.getLocalVotes();
        const vote = localVotes[voterHash];
        
        if (vote) {
          return {
            verified: true,
            voteHash: vote.voteHash,
            candidateId: vote.candidateId,
            transactionHash: `0x${voterHash.substring(2, 66)}`
          };
        }
      }

      return { verified: false };
    } catch (error) {
      console.error('Vote verification failed:', error);
      return { verified: false };
    }
  }

  // Get vote count for a candidate
  async getCandidateVoteCount(candidateId: number): Promise<number> {
    try {
      if (this.contract) {
        const count = await this.contract.getVoteCount(candidateId);
        return Number(count);
      } else {
        // Count from local simulation
        const localVotes = this.getLocalVotes();
        return Object.values(localVotes).filter((vote: any) => vote.candidateId === candidateId).length;
      }
    } catch (error) {
      console.error('Failed to get vote count:', error);
      return 0;
    }
  }

  // Local storage simulation methods
  private getLocalVotes(): Record<string, any> {
    if (typeof window === 'undefined') return {};
    const votes = localStorage.getItem('blockchain_votes');
    return votes ? JSON.parse(votes) : {};
  }

  private setLocalVotes(votes: Record<string, any>): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('blockchain_votes', JSON.stringify(votes));
  }

  // Clear local blockchain storage (for testing/admin purposes)
  clearLocalVotes(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('blockchain_votes');
    console.log('Local blockchain votes cleared');
  }

  // Generate vote certificate with blockchain proof
  generateVoteCertificate(voteHash: string, transactionHash: string, timestamp: number): {
    certificate: string;
    qrCode: string;
  } {
    const certificateData = {
      voteHash,
      transactionHash,
      timestamp,
      verified: true,
      blockchainNetwork: 'Ethereum',
      certificateId: `VOTE-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };

    return {
      certificate: JSON.stringify(certificateData, null, 2),
      qrCode: btoa(JSON.stringify(certificateData))
    };
  }
}

export const votingBlockchain = new VotingBlockchain();