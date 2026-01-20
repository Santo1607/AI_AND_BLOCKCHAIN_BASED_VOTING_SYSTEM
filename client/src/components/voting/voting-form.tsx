import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { verificationSchema, type VerificationData, type Election, type Candidate } from "@shared/schema";
import { EnhancedBiometricVerification } from "./enhanced-biometric-verification";
import { votingBlockchain } from "@/lib/blockchain";
import { useLanguage } from "@/hooks/use-language";
import { Vote, IdCard, Calendar, ArrowLeft, CheckCircle, AlertCircle, User, Clock } from "lucide-react";

interface VotingFormProps {
  onBack: () => void;
}

export function VotingForm({ onBack }: VotingFormProps) {
  const [step, setStep] = useState<"verify" | "election-select" | "biometric" | "vote" | "success">("verify");
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [voterData, setVoterData] = useState<{ aadharNumber: string; fingerprintData?: string } | null>(null);
  const [citizenData, setCitizenData] = useState<{ name: string; photoUrl: string | null; fingerprintData?: string; state?: string; constituency?: string } | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [voteReceipt, setVoteReceipt] = useState<{
    transactionHash: string;
    blockchainHash: string;
    timestamp: string;
    candidateName: string;
    voteId: number;
  } | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const form = useForm<VerificationData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      aadharNumber: "",
      dateOfBirth: ""
    }
  });

  const { data: elections } = useQuery<Election[]>({
    queryKey: ["/api/elections"],
  });

  const activeElections = elections?.filter(election => {
    if (election.status !== "active") return false;

    // Filter based on location if citizen data is available
    if (citizenData) {
      if (election.electionScope === "State") {
        return election.state === citizenData.state;
      }
      if (election.electionScope === "Constituency") {
        // Match state first, then constituency
        return election.state === citizenData.state && election.constituency === citizenData.constituency;
      }
    }

    return true;
  }) || [];

  const { data: candidates } = useQuery<Candidate[]>({
    queryKey: ["/api/candidates", selectedElection?.id, citizenData?.constituency],
    queryFn: async () => {
      const url = new URL(`${window.location.origin}/api/candidates`);
      if (selectedElection?.id) url.searchParams.append("electionId", selectedElection.id.toString());
      if (citizenData?.constituency) url.searchParams.append("constituency", citizenData.constituency);

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch candidates');
      return response.json();
    },
    enabled: !!selectedElection && !!citizenData?.constituency,
  });

  const formatAadharNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 4) return numbers;
    if (numbers.length <= 8) return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
    return `${numbers.slice(0, 4)}-${numbers.slice(4, 8)}-${numbers.slice(8, 12)}`;
  };

  const onVerifySubmit = async (data: VerificationData) => {
    setIsVerifying(true);
    try {
      console.log('Starting voter verification process...');
      const response = await apiRequest("POST", "/api/voter/check-eligibility", data);
      const result = await response.json();
      console.log('Eligibility result:', result);

      if (result.eligible) {
        setVoterData({
          aadharNumber: data.aadharNumber
        });

        // Fetch citizen data first to know constituency
        console.log('Fetching citizen data...');
        const verifyResponse = await apiRequest("POST", "/api/verify", data);
        const verifyResult = await verifyResponse.json();
        console.log('Citizen verification result:', verifyResult);

        if (verifyResult.success) {
          setCitizenData({
            name: verifyResult.citizen.name,
            photoUrl: verifyResult.citizen.photoUrl,
            state: verifyResult.citizen.state,
            constituency: verifyResult.citizen.constituency,
            fingerprintData: verifyResult.citizen.fingerprintData
          });
          setStep("election-select");
          toast({
            title: "Identity Verified",
            description: `Welcome, ${verifyResult.citizen.name}. Please select an election.`,
          });
        } else {
          throw new Error("Unable to fetch citizen data for verification.");
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "Unable to verify voter eligibility.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const onElectionSelect = async (election: Election) => {
    if (!voterData) return;

    try {
      // Check if already voted in THIS election
      const voteStatusResponse = await apiRequest("POST", "/api/voter/check-vote-status", {
        electionId: election.id,
        aadharNumber: voterData.aadharNumber
      });
      const voteStatus = await voteStatusResponse.json();

      if (voteStatus.hasVoted) {
        toast({
          title: "Already Voted",
          description: `You have already cast your vote in ${election.title}.`,
          variant: "destructive"
        });
        return;
      }

      setSelectedElection(election);
      setStep("biometric");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to check voting status.",
        variant: "destructive"
      });
    }
  };

  const handleBiometricVerification = (verified: boolean) => {
    if (verified) {
      setStep("vote");
      toast({
        title: "Biometric Verification Successful",
        description: "Identity confirmed. You may now proceed to vote.",
      });
    } else {
      toast({
        title: "Biometric Verification Failed",
        description: "Identity verification failed. Please try again or contact support.",
        variant: "destructive"
      });
      setStep("verify");
      setVoterData(null);
      setCitizenData(null);
    }
  };

  const handleVote = async () => {
    if (!selectedCandidate || !voterData || !selectedElection) return;

    setIsVoting(true);
    try {
      // Step 1: Cast vote on blockchain for integrity
      if (selectedElection.blockchainAddress) {
        votingBlockchain.setContractAddress(selectedElection.blockchainAddress);
      }
      const blockchainResult = await votingBlockchain.castVoteOnChain(
        voterData.aadharNumber,
        selectedElection.id,
        selectedCandidate
      );

      if (!blockchainResult.success) {
        throw new Error(blockchainResult.error || "Blockchain verification failed");
      }

      // Step 2: Record vote in database with blockchain proof
      const response = await apiRequest("POST", "/api/vote", {
        electionId: selectedElection.id,
        candidateId: selectedCandidate,
        voterAadhar: voterData.aadharNumber,
        blockchainHash: blockchainResult.voteHash,
        transactionHash: blockchainResult.transactionHash,
        clientTime: new Date().toISOString() // Send client's local time
      });

      const result = await response.json();

      if (result.success) {
        // Find the selected candidate name
        const candidate = candidates?.find(c => c.id === selectedCandidate);

        // Set vote receipt data
        setVoteReceipt({
          transactionHash: blockchainResult.transactionHash || 'LOCAL_' + Date.now(),
          blockchainHash: blockchainResult.voteHash,
          timestamp: new Date().toISOString(),
          candidateName: candidate?.name || 'Unknown Candidate',
          voteId: result.voteId
        });

        setStep("success");
        toast({
          title: "Vote Cast Successfully",
          description: `Your vote has been recorded securely with blockchain verification. Transaction: ${blockchainResult.transactionHash?.substring(0, 10)}...`,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: "Voting Failed",
        description: error.message || "Failed to cast vote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVoting(false);
    }
  };

  if (step === "success") {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <Vote className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Digital Voting</h1>
                  <p className="text-sm text-gray-500">Vote Cast Successfully</p>
                </div>
              </div>
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Portal
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900">{t('voteCastSuccessfully')}</CardTitle>
              <p className="text-gray-600 mt-4">{t('thankYouParticipating')}</p>
            </CardHeader>

            <CardContent className="text-center">
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span>Vote recorded securely</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span>Identity verified</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span>Blockchain verified</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span>Vote encrypted and anonymized</span>
                </div>
              </div>

              {voteReceipt && (
                <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6 mb-8">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    {t('voteCertificate')}
                  </h3>

                  <div className="grid grid-cols-1 gap-4 text-left">
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">{t('voteId')}</p>
                      <p className="text-lg font-mono text-gray-900">#{voteReceipt.voteId}</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">{t('voteStatus')}</p>
                      <p className="text-lg text-green-600 font-semibold">{t('successfullyRecorded')}</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">{t('timestamp')}</p>
                      <p className="text-lg text-gray-900">
                        {new Date(voteReceipt.timestamp).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>{t('important')}:</strong> {t('voteRecordedMessage')}
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-blue-900 mb-2">{t('votingComplete')}</h3>
                <p className="text-sm text-blue-800">
                  {t('votingCompleteMessage')}
                </p>
              </div>

              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={onBack}
              >
                {t('returnToPortal')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === "biometric") {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Vote className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Digital Voting</h1>
                  <p className="text-sm text-gray-500">Biometric Verification</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setStep("verify")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-12">
          <EnhancedBiometricVerification
            storedPhotoUrl={citizenData?.photoUrl ?? undefined}
            storedFingerprintData={citizenData?.fingerprintData}
            onVerificationComplete={(success, results) => {
              if (success) {
                setStep("vote");
                toast({
                  title: "Verification Successful",
                  description: `Biometric verification completed with ${Math.round(results.confidence)}% confidence.`
                });
              } else {
                toast({
                  title: "Verification Failed",
                  description: "Biometric verification failed. Please try again.",
                  variant: "destructive"
                });
              }
            }}
            onCancel={() => setStep("election-select")}
          />
        </div>
      </div>
    );
  }

  if (step === "election-select") {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Vote className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Digital Voting</h1>
                  <p className="text-sm text-gray-500">Select Election</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setStep("verify")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Active Elections</h2>
            <p className="text-gray-600">Please select the election you wish to vote in.</p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {activeElections.length > 0 ? (
              activeElections.map((election) => (
                <Card
                  key={election.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-blue-600"
                  onClick={() => onElectionSelect(election)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{election.title}</CardTitle>
                        <p className="text-gray-500 mt-1">{election.description}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">ACTIVE</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-6 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                        Ends: {new Date(election.endDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-blue-600" />
                        Time: {election.votingStartTime} - {election.votingEndTime}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No Active Elections</h3>
                <p className="text-gray-500">There are currently no active elections available for voting.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === "vote") {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <Vote className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Digital Voting</h1>
                  <p className="text-sm text-gray-500">Cast Your Vote</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setStep("election-select")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{selectedElection?.title}</h2>
            <p className="text-lg text-gray-600">{selectedElection?.description}</p>
            <div className="mt-4 space-x-4">
              <Badge className="bg-green-100 text-green-800">
                Aadhar ID: {voterData?.aadharNumber}
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                Constituency: {citizenData?.constituency}
              </Badge>
            </div>
          </div>

          <Card className="shadow-xl border-0 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-900 text-center">
                Select Your Candidate
              </CardTitle>
              <p className="text-center text-gray-600">
                Choose one candidate to cast your vote
              </p>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {candidates?.map((candidate) => (
                  <Card
                    key={candidate.id}
                    className={`cursor-pointer transition-all duration-200 ${selectedCandidate === candidate.id
                      ? "ring-2 ring-green-500 bg-green-50"
                      : "hover:shadow-lg"
                      }`}
                    onClick={() => setSelectedCandidate(candidate.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                          {candidate.photoUrl ? (
                            <img
                              src={candidate.photoUrl}
                              alt={candidate.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-8 h-8 text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {candidate.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">{candidate.party}</p>
                          <div className="flex items-center space-x-2 mb-3">
                            <Badge variant="outline">
                              Symbol: {candidate.symbol}
                            </Badge>
                          </div>
                          {candidate.manifesto && (
                            <p className="text-sm text-gray-700">{candidate.manifesto}</p>
                          )}
                        </div>
                        {selectedCandidate === candidate.id && (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8 text-center">
                <Button
                  onClick={handleVote}
                  disabled={!selectedCandidate || isVoting}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 text-lg font-semibold"
                >
                  {isVoting ? (
                    <>Casting Vote...</>
                  ) : (
                    <>
                      <Vote className="w-5 h-5 mr-2" />
                      Cast Your Vote
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Vote className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Digital Voting</h1>
                <p className="text-sm text-gray-500">Voter Verification</p>
              </div>
            </div>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Portal
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Verify Your Identity</h2>
          <p className="text-lg text-gray-600">
            Enter your Aadhar details to verify your voter registration and eligibility
          </p>
        </div>

        {activeElections.length === 0 ? (
          <Card className="shadow-xl border-0">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Election</h3>
              <p className="text-gray-600">
                There are currently no active elections. Please check back when voting is open.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-900 text-center">
                Voter Verification Required
              </CardTitle>
              <p className="text-center text-gray-600 mt-2">
                Multiple active elections are available. Please verify your identity to proceed.
              </p>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onVerifySubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="aadharNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-medium text-gray-900 flex items-center">
                          <IdCard className="w-5 h-5 mr-2 text-green-600" />
                          Aadhar Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="XXXX-XXXX-XXXX"
                            className="text-lg px-6 py-4 input-focus"
                            onChange={(e) => {
                              const formatted = formatAadharNumber(e.target.value);
                              field.onChange(formatted);
                            }}
                            maxLength={14}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-medium text-gray-900 flex items-center">
                          <Calendar className="w-5 h-5 mr-2 text-green-600" />
                          Date of Birth
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="date"
                            className="text-lg px-6 py-4 input-focus"
                            max={new Date().toISOString().split('T')[0]}
                            min="1900-01-01"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full py-4 px-6 text-lg font-semibold bg-green-600 hover:bg-green-700"
                    disabled={isVerifying}
                  >
                    {isVerifying ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Verifying...
                      </div>
                    ) : (
                      <>
                        <Vote className="w-5 h-5 mr-2" />
                        Verify & Proceed to Vote
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}