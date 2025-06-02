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
import { Vote, IdCard, Calendar, ArrowLeft, CheckCircle, AlertCircle, User } from "lucide-react";

interface VotingFormProps {
  onBack: () => void;
}

export function VotingForm({ onBack }: VotingFormProps) {
  const [step, setStep] = useState<"verify" | "biometric" | "vote" | "success">("verify");
  const [voterData, setVoterData] = useState<{ aadharNumber: string; voterIdNumber: string; fingerprintData?: string } | null>(null);
  const [citizenData, setCitizenData] = useState<{ name: string; photoUrl: string | null; fingerprintData?: string; constituency?: string } | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const { toast } = useToast();

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

  const activeElection = elections?.find(election => election.status === "active");

  const { data: candidates } = useQuery<Candidate[]>({
    queryKey: ["/api/candidates", citizenData?.constituency],
    queryFn: async () => {
      const url = citizenData?.constituency 
        ? `/api/candidates?constituency=${encodeURIComponent(citizenData.constituency)}`
        : '/api/candidates';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch candidates');
      return response.json();
    },
    enabled: !!citizenData?.constituency,
  });

  const formatAadharNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 4) return numbers;
    if (numbers.length <= 8) return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
    return `${numbers.slice(0, 4)}-${numbers.slice(4, 8)}-${numbers.slice(8, 12)}`;
  };

  const onVerifySubmit = async (data: VerificationData) => {
    try {
      const response = await apiRequest("POST", "/api/voter/check-eligibility", data);
      const result = await response.json();
      
      if (result.eligible) {
        setVoterData({
          aadharNumber: data.aadharNumber,
          voterIdNumber: result.voterIdNumber
        });
        
        // Check if already voted
        const voteStatusResponse = await apiRequest("POST", "/api/voter/check-vote-status", {
          electionId: activeElection?.id,
          aadharNumber: data.aadharNumber
        });
        const voteStatus = await voteStatusResponse.json();
        
        if (voteStatus.hasVoted) {
          toast({
            title: "Already Voted",
            description: "You have already cast your vote in this election.",
            variant: "destructive"
          });
          return;
        }

        // Fetch citizen data for biometric verification
        const verifyResponse = await apiRequest("POST", "/api/verify", data);
        const verifyResult = await verifyResponse.json();
        
        if (verifyResult.success) {
          setCitizenData({
            name: verifyResult.citizen.name,
            photoUrl: verifyResult.citizen.photoUrl,
            constituency: verifyResult.citizen.constituency,
            fingerprintData: verifyResult.citizen.fingerprintData
          });
          setStep("biometric");
        } else {
          throw new Error("Unable to fetch citizen data for verification.");
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Unable to verify voter eligibility.",
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
    if (!selectedCandidate || !voterData || !activeElection) return;
    
    setIsVoting(true);
    try {
      const response = await apiRequest("POST", "/api/vote", {
        electionId: activeElection.id,
        candidateId: selectedCandidate,
        voterAadhar: voterData.aadharNumber
      });
      
      const result = await response.json();
      
      if (result.success) {
        setStep("success");
        toast({
          title: "Vote Cast Successfully",
          description: "Your vote has been recorded securely.",
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
              <CardTitle className="text-3xl font-bold text-gray-900">Vote Cast Successfully!</CardTitle>
              <p className="text-gray-600 mt-4">Thank you for participating in the democratic process</p>
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
                  <span>Vote encrypted and anonymized</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-blue-900 mb-2">Important Information</h3>
                <p className="text-sm text-blue-800">
                  Your vote has been cast and cannot be changed. The voting process is complete and secure. 
                  You can check election results once voting closes.
                </p>
              </div>

              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={onBack}
              >
                Return to Portal
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
            onCancel={() => setStep("verify")}
          />
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
              <Button variant="outline" onClick={() => setStep("verify")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{activeElection?.title}</h2>
            <p className="text-lg text-gray-600">{activeElection?.description}</p>
            <div className="mt-4 space-x-4">
              <Badge className="bg-green-100 text-green-800">
                Voter ID: {voterData?.voterIdNumber}
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
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedCandidate === candidate.id 
                        ? "ring-2 ring-green-500 bg-green-50" 
                        : "hover:shadow-lg"
                    }`}
                    onClick={() => setSelectedCandidate(candidate.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-gray-500" />
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

        {!activeElection ? (
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
                Current Election: <strong>{activeElection.title}</strong>
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
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full py-4 px-6 text-lg font-semibold bg-green-600 hover:bg-green-700"
                  >
                    <Vote className="w-5 h-5 mr-2" />
                    Verify & Proceed to Vote
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