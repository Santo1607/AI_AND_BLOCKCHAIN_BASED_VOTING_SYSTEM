import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Calendar, Clock, Settings, TrendingUp, Users, Vote, BarChart3, PieChart } from "lucide-react";
import type { Election } from "@shared/schema";

const constituencies = [
  'Central Delhi', 'East Delhi', 'North Delhi', 'South Delhi', 'West Delhi',
  'Mumbai North', 'Mumbai South', 'Mumbai Central', 
  'Bangalore North', 'Bangalore South', 'Bangalore Central',
  'Chennai North', 'Chennai South', 'Chennai Central',
  'Coimbatore', 'Madurai', 'Salem', 'Tiruchirapalli', 'Tirunelveli',
  'Vellore', 'Erode', 'Tiruppur', 'Dindigul', 'Thanjavur',
  'Cuddalore', 'Nagapattinam', 'Mayiladuthurai', 'Ariyalur'
];

export function ElectionManagement() {
  const [editingElection, setEditingElection] = useState<Election | null>(null);
  const [votingStartTime, setVotingStartTime] = useState("08:00");
  const [votingEndTime, setVotingEndTime] = useState("17:00");
  const [resultsTime, setResultsTime] = useState("18:00");
  const [selectedConstituency, setSelectedConstituency] = useState<string>("all");
  const { toast } = useToast();

  const { data: elections, isLoading: electionsLoading } = useQuery({
    queryKey: ['/api/elections'],
    queryFn: () => apiRequest("GET", "/api/elections").then(res => res.json())
  });

  const { data: constituencyResults, isLoading: resultsLoading } = useQuery({
    queryKey: ['/api/elections/1/constituency-results'],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/elections/1/constituency-results");
        return await response.json();
      } catch (error) {
        return { constituencyResults: {}, overallWinner: null, totalVotes: 0 };
      }
    }
  });

  const updateElectionMutation = useMutation({
    mutationFn: async (data: { id: number; timings: any }) => {
      const response = await apiRequest("PATCH", `/api/elections/${data.id}`, data.timings);
      if (!response.ok) throw new Error('Failed to update election');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/elections'] });
      toast({ title: 'Success', description: 'Election timings updated successfully' });
      setEditingElection(null);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update election timings', variant: 'destructive' });
    }
  });

  const handleSaveTimings = () => {
    if (!editingElection) return;
    
    updateElectionMutation.mutate({
      id: editingElection.id,
      timings: {
        votingStartTime,
        votingEndTime,
        resultsTime
      }
    });
  };

  // Time status calculation
  const getCurrentTimeStatus = () => {
    const now = new Date();
    const currentHour = now.getHours();
    
    const votingStart = 8; // 8 AM
    const votingEnd = 17; // 5 PM
    const resultsStart = 18; // 6 PM
    
    if (currentHour < votingStart) {
      return { status: 'pending', message: 'Voting not yet started', color: 'bg-gray-500' };
    } else if (currentHour >= votingStart && currentHour < votingEnd) {
      return { status: 'active', message: 'Voting in progress', color: 'bg-green-600' };
    } else if (currentHour >= votingEnd && currentHour < resultsStart) {
      return { status: 'ended', message: 'Voting ended, results pending', color: 'bg-orange-600' };
    } else {
      return { status: 'results', message: 'Results available', color: 'bg-blue-600' };
    }
  };

  const timeStatus = getCurrentTimeStatus();

  // Helper functions for calculations
  const calculatePercentage = (votes: number, total: number) => {
    return total > 0 ? ((votes / total) * 100).toFixed(1) : "0.0";
  };

  const getPartyWiseResults = (constituencyResults: any) => {
    const partyStats = new Map<string, { votes: number; constituencies: number; candidates: string[] }>();
    
    Object.values(constituencyResults.constituencyResults || {}).forEach((candidates: any) => {
      candidates.forEach((candidate: any) => {
        if (!partyStats.has(candidate.party)) {
          partyStats.set(candidate.party, { votes: 0, constituencies: 0, candidates: [] });
        }
        const party = partyStats.get(candidate.party)!;
        party.votes += candidate.voteCount;
        party.candidates.push(candidate.candidateName);
        if (candidate.isWinner) {
          party.constituencies += 1;
        }
      });
    });

    return Array.from(partyStats.entries()).map(([party, data]) => ({
      party,
      totalVotes: data.votes,
      constituenciesWon: data.constituencies,
      candidates: Array.from(new Set(data.candidates)),
      percentage: calculatePercentage(data.votes, constituencyResults.totalVotes || 0)
    })).sort((a, b) => b.totalVotes - a.totalVotes);
  };

  const getFilteredResults = () => {
    if (!constituencyResults) return null;
    
    if (selectedConstituency === "all") {
      return constituencyResults.constituencyResults;
    } else {
      const constituencyData = constituencyResults.constituencyResults[selectedConstituency];
      return {
        [selectedConstituency]: constituencyData || []
      };
    }
  };

  if (electionsLoading) {
    return <div className="text-center py-8">Loading elections...</div>;
  }

  const activeElection = elections?.[0];
  const partyStats = constituencyResults ? getPartyWiseResults(constituencyResults) : [];
  const filteredResults = getFilteredResults();

  return (
    <div className="space-y-6">
      {/* Election Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Vote className="w-5 h-5" />
            <span>Election Status & Timing Control</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`w-16 h-16 ${timeStatus.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Current Status</h3>
              <p className="text-gray-600">{timeStatus.message}</p>
              <div className="mt-2">
                <Badge 
                  variant={timeStatus.status === 'active' ? 'default' : 'secondary'}
                  className={`${
                    timeStatus.status === 'active' ? 'bg-green-600' : 
                    timeStatus.status === 'results' ? 'bg-blue-600' : 
                    timeStatus.status === 'ended' ? 'bg-orange-600' : 'bg-gray-500'
                  } text-white`}
                >
                  {timeStatus.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Election Schedule</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Voting: 8:00 AM - 5:00 PM</p>
                <p>Results: 6:00 PM onwards</p>
              </div>
              <div className="mt-2">
                <Badge 
                  variant="outline"
                  className="border-purple-600 text-purple-600"
                >
                  {timeStatus.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="text-center">
              <Button 
                onClick={() => setEditingElection(activeElection)}
                className="w-full"
                disabled={!activeElection}
              >
                <Settings className="w-4 h-4 mr-2" />
                Edit Timings
              </Button>
            </div>
          </div>

          {editingElection && (
            <div className="mt-6 p-6 bg-gray-50 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Edit Election Timings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="votingStart">Voting Start Time</Label>
                  <Input
                    id="votingStart"
                    type="time"
                    value={votingStartTime}
                    onChange={(e) => setVotingStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="votingEnd">Voting End Time</Label>
                  <Input
                    id="votingEnd"
                    type="time"
                    value={votingEndTime}
                    onChange={(e) => setVotingEndTime(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="resultsTime">Results Available Time</Label>
                  <Input
                    id="resultsTime"
                    type="time"
                    value={resultsTime}
                    onChange={(e) => setResultsTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-4">
                <Button onClick={handleSaveTimings} disabled={updateElectionMutation.isPending}>
                  {updateElectionMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outline" onClick={() => setEditingElection(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Election Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Election Results</span>
            </div>
            {timeStatus.status === 'results' && (
              <Select value={selectedConstituency} onValueChange={setSelectedConstituency}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select Constituency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Constituencies</SelectItem>
                  {constituencies.map((constituency) => (
                    <SelectItem key={constituency} value={constituency}>
                      {constituency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timeStatus.status === 'results' ? (
            resultsLoading ? (
              <div className="text-center py-8">Loading results...</div>
            ) : constituencyResults && Object.keys(constituencyResults.constituencyResults || {}).length > 0 ? (
              <div className="space-y-6">
                {/* Overall Winner Section */}
                {constituencyResults.overallWinner && selectedConstituency === "all" && (
                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-lg p-6">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Vote className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-yellow-900 mb-2">Overall Election Winner</h3>
                      <p className="text-3xl font-bold text-yellow-900">{constituencyResults.overallWinner.candidateName}</p>
                      <p className="text-lg text-yellow-800 mb-4">{constituencyResults.overallWinner.party}</p>
                      <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-sm text-gray-600">Constituencies Won</p>
                          <p className="text-2xl font-bold text-yellow-900">{constituencyResults.overallWinner.constituenciesWon}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-sm text-gray-600">Total Votes</p>
                          <p className="text-2xl font-bold text-yellow-900">{constituencyResults.overallWinner.totalVotes}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-sm text-gray-600">Vote Share</p>
                          <p className="text-2xl font-bold text-yellow-900">
                            {calculatePercentage(constituencyResults.overallWinner.totalVotes, constituencyResults.totalVotes)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Party-wise Results */}
                {selectedConstituency === "all" && partyStats.length > 0 && (
                  <div className="bg-white border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-6 py-3 border-b">
                      <h4 className="text-xl font-bold text-gray-900 flex items-center">
                        <PieChart className="w-5 h-5 mr-2" />
                        Party-wise Performance
                      </h4>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {partyStats.map((party, index) => (
                          <div key={party.party} className={`p-4 rounded-lg border ${
                            index === 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-semibold text-gray-900">{party.party}</h5>
                              {index === 0 && <Badge className="bg-green-600">Leading</Badge>}
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Total Votes:</span>
                                <span className="font-semibold">{party.totalVotes}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Constituencies Won:</span>
                                <span className="font-semibold">{party.constituenciesWon}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Vote Share:</span>
                                <span className="font-semibold">{party.percentage}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-900">Total Votes Cast</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900 mt-2">
                      {selectedConstituency === "all" ? constituencyResults.totalVotes : 
                       (() => {
                         if (!filteredResults) return 0;
                         const constituencyData = Object.values(filteredResults)[0] as any[];
                         if (!constituencyData || !Array.isArray(constituencyData)) return 0;
                         return constituencyData.reduce((sum: number, c: any) => sum + (c?.voteCount || 0), 0);
                       })()}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Vote className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-900">Constituencies</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900 mt-2">
                      {selectedConstituency === "all" ? Object.keys(constituencyResults.constituencyResults).length : 1}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-purple-900">Turnout</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900 mt-2">
                      {calculatePercentage(constituencyResults.totalVotes, 1000)}%
                    </p>
                  </div>
                </div>

                {/* Constituency Results */}
                <div className="space-y-6">
                  <h4 className="text-xl font-bold text-gray-900">
                    {selectedConstituency === "all" ? "All Constituency Results" : `${selectedConstituency} Results`}
                  </h4>
                  {filteredResults && Object.entries(filteredResults).map(([constituency, candidates]: [string, any]) => {
                    const totalConstituencyVotes = candidates.reduce((sum: number, c: any) => sum + c.voteCount, 0);
                    return (
                      <div key={constituency} className="bg-white border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-6 py-3 border-b">
                          <div className="flex items-center justify-between">
                            <h5 className="text-lg font-semibold text-gray-900">{constituency}</h5>
                            <span className="text-sm text-gray-600">Total Votes: {totalConstituencyVotes}</span>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="space-y-3">
                            {candidates.map((candidate: any, index: number) => (
                              <div key={candidate.candidateId} className={`p-4 rounded-lg border ${
                                candidate.isWinner ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                      candidate.isWinner ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'
                                    }`}>
                                      {index + 1}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-900">{candidate.candidateName}</p>
                                      <p className="text-sm text-gray-600">{candidate.party}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xl font-bold text-gray-900">{candidate.voteCount}</p>
                                    <p className="text-sm text-gray-600">
                                      {calculatePercentage(candidate.voteCount, totalConstituencyVotes)}%
                                    </p>
                                  </div>
                                  {candidate.isWinner && (
                                    <Badge className="bg-green-600 ml-3">
                                      Winner
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Vote className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Available</h3>
                <p className="text-gray-600">Election results will be available after voting ends and counting is complete.</p>
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Results Not Yet Available</h3>
              <p className="text-gray-600">
                {timeStatus.status === 'pending' && 'Voting has not started yet. Results will be available after 6:00 PM.'}
                {timeStatus.status === 'active' && 'Voting is currently in progress. Results will be available after 6:00 PM.'}
                {timeStatus.status === 'ended' && 'Voting has ended. Results will be available starting at 6:00 PM.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}