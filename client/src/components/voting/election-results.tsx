import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, ArrowLeft, Trophy, Users, BarChart3 } from "lucide-react";
import type { Election } from "@shared/schema";

interface ElectionResultsProps {
  onBack: () => void;
}

interface ElectionResult {
  candidateId: number;
  candidateName: string;
  party: string;
  voteCount: number;
}

export function ElectionResults({ onBack }: ElectionResultsProps) {
  const [selectedElectionId, setSelectedElectionId] = useState<string>("");

  const { data: elections } = useQuery<Election[]>({
    queryKey: ["/api/elections"],
  });

  const { data: results, isLoading } = useQuery<ElectionResult[]>({
    queryKey: ["/api/elections", selectedElectionId, "results"],
    enabled: !!selectedElectionId,
  });

  const selectedElection = elections?.find(e => e.id.toString() === selectedElectionId);
  const totalVotes = results?.reduce((sum, result) => sum + result.voteCount, 0) || 0;

  const getVotePercentage = (voteCount: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((voteCount / totalVotes) * 100);
  };

  const winner = results?.[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Election Results</h1>
                <p className="text-sm text-gray-500">Digital Voting Portal</p>
              </div>
            </div>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Portal
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Election Results</h2>
          <p className="text-lg text-gray-600">
            View real-time voting results and statistics for all elections
          </p>
        </div>

        {/* Election Selection */}
        <Card className="shadow-xl border-0 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Select Election
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedElectionId} onValueChange={setSelectedElectionId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose an election to view results" />
              </SelectTrigger>
              <SelectContent>
                {elections?.map((election) => (
                  <SelectItem key={election.id} value={election.id.toString()}>
                    <div className="flex items-center space-x-2">
                      <span>{election.title}</span>
                      <Badge 
                        variant={election.status === "active" ? "default" : "secondary"}
                        className={election.status === "active" ? "bg-green-100 text-green-800" : ""}
                      >
                        {election.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedElection && (
          <>
            {/* Election Info */}
            <Card className="shadow-lg border-0 mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedElection.title}</h3>
                    <p className="text-gray-600 mt-1">{selectedElection.description}</p>
                    <div className="flex items-center space-x-4 mt-3">
                      <Badge 
                        variant={selectedElection.status === "active" ? "default" : "secondary"}
                        className={selectedElection.status === "active" ? "bg-green-100 text-green-800" : ""}
                      >
                        {selectedElection.status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(selectedElection.startDate).toLocaleDateString()} - {new Date(selectedElection.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-orange-600">{totalVotes}</div>
                    <div className="text-sm text-gray-500">Total Votes</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isLoading ? (
              <Card className="shadow-lg border-0">
                <CardContent className="p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading results...</p>
                </CardContent>
              </Card>
            ) : results && results.length > 0 ? (
              <>
                {/* Winner Card */}
                {winner && totalVotes > 0 && (
                  <Card className="shadow-xl border-0 mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-orange-200">
                    <CardContent className="p-8 text-center">
                      <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Leading Candidate</h3>
                      <p className="text-xl font-semibold text-orange-600 mb-1">{winner.candidateName}</p>
                      <p className="text-gray-600 mb-4">{winner.party}</p>
                      <div className="flex items-center justify-center space-x-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{winner.voteCount}</div>
                          <div className="text-sm text-gray-500">Votes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{getVotePercentage(winner.voteCount)}%</div>
                          <div className="text-sm text-gray-500">Share</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Results Table */}
                <Card className="shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Detailed Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {results.map((result, index) => (
                        <div key={`result-${result.candidateId}-${index}`} className="border-b border-gray-200 pb-6 last:border-b-0">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${
                                index === 0 ? 'bg-yellow-500' : 
                                index === 1 ? 'bg-gray-400' : 
                                index === 2 ? 'bg-orange-400' : 'bg-gray-300'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{result.candidateName}</h4>
                                <p className="text-sm text-gray-600">{result.party}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-gray-900">{result.voteCount}</div>
                              <div className="text-sm text-gray-500">{getVotePercentage(result.voteCount)}%</div>
                            </div>
                          </div>
                          <Progress 
                            value={getVotePercentage(result.voteCount)} 
                            className="h-3"
                          />
                        </div>
                      ))}
                    </div>

                    {totalVotes === 0 && (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No votes have been cast yet for this election.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="shadow-lg border-0">
                <CardContent className="p-8 text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No results available for this election.</p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {!selectedElectionId && elections && elections.length > 0 && (
          <Card className="shadow-lg border-0">
            <CardContent className="p-8 text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Please select an election to view results.</p>
            </CardContent>
          </Card>
        )}

        {elections && elections.length === 0 && (
          <Card className="shadow-lg border-0">
            <CardContent className="p-8 text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No elections are currently available.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}