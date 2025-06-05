import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Calendar, Clock, Settings, TrendingUp, Users, Vote } from "lucide-react";
import type { Election } from "@shared/schema";

export function ElectionManagement() {
  const [editingElection, setEditingElection] = useState<Election | null>(null);
  const [votingStartTime, setVotingStartTime] = useState("08:00");
  const [votingEndTime, setVotingEndTime] = useState("17:00");
  const [resultsTime, setResultsTime] = useState("18:00");
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
        resultsTime,
        updatedAt: new Date().toISOString()
      }
    });
  };

  const getCurrentTimeStatus = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const votingStart = parseInt(votingStartTime.split(':')[0]);
    const votingEnd = parseInt(votingEndTime.split(':')[0]);
    const resultsStart = parseInt(resultsTime.split(':')[0]);

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

  if (electionsLoading) {
    return <div className="text-center py-8">Loading elections...</div>;
  }

  const activeElection = elections?.[0];

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
              <p className="font-semibold text-gray-900">{timeStatus.message}</p>
              <p className="text-sm text-gray-600 mt-1">
                Current time: {new Date().toLocaleTimeString('en-IN', { hour12: true })}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Voting Hours:</span>
                <Badge variant="outline">{votingStartTime} - {votingEndTime}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Results Available:</span>
                <Badge variant="outline">{resultsTime} onwards</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Election Status:</span>
                <Badge className={timeStatus.color.replace('bg-', 'bg-').replace('-600', '-100 text-') + timeStatus.color.split('-')[1] + '-800'}>
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
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Election Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timeStatus.status === 'results' ? (
            resultsLoading ? (
              <div className="text-center py-8">Loading results...</div>
            ) : constituencyResults && Object.keys(constituencyResults.constituencyResults || {}).length > 0 ? (
              <div className="space-y-6">
                {/* Overall Winner Section */}
                {constituencyResults.overallWinner && (
                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-lg p-6">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Vote className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-yellow-900 mb-2">🏆 Overall Winner</h3>
                      <p className="text-3xl font-bold text-yellow-900">{constituencyResults.overallWinner.candidateName}</p>
                      <p className="text-lg text-yellow-800">{constituencyResults.overallWinner.party}</p>
                      <div className="grid grid-cols-2 gap-4 mt-4 max-w-md mx-auto">
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-sm text-gray-600">Constituencies Won</p>
                          <p className="text-2xl font-bold text-yellow-900">{constituencyResults.overallWinner.constituenciesWon}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-sm text-gray-600">Total Votes</p>
                          <p className="text-2xl font-bold text-yellow-900">{constituencyResults.overallWinner.totalVotes}</p>
                        </div>
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
                      {constituencyResults.totalVotes}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Vote className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-900">Constituencies</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900 mt-2">
                      {Object.keys(constituencyResults.constituencyResults).length}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-purple-900">Total Candidates</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900 mt-2">
                      {Object.values(constituencyResults.constituencyResults).reduce((total: number, candidates: any) => total + candidates.length, 0)}
                    </p>
                  </div>
                </div>

                {/* Constituency-wise Results */}
                <div className="space-y-6">
                  <h4 className="text-xl font-bold text-gray-900">Constituency-wise Results</h4>
                  {Object.entries(constituencyResults.constituencyResults).map(([constituency, candidates]: [string, any]) => (
                    <div key={constituency} className="bg-white border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-6 py-3 border-b">
                        <h5 className="text-lg font-semibold text-gray-900">{constituency}</h5>
                      </div>
                      <div className="p-4">
                        <div className="space-y-3">
                          {candidates.map((candidate: any, index: number) => (
                            <div key={candidate.candidateId} className={`flex items-center justify-between p-3 rounded-lg border ${
                              candidate.isWinner ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                            }`}>
                              <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                  candidate.isWinner ? 'bg-green-600' : 
                                  index === 0 ? 'bg-yellow-500' : 
                                  index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                                }`}>
                                  {candidate.isWinner ? '👑' : index + 1}
                                </div>
                                <div>
                                  <p className={`font-semibold ${candidate.isWinner ? 'text-green-900' : 'text-gray-900'}`}>
                                    {candidate.candidateName}
                                    {candidate.isWinner && <span className="ml-2 text-sm bg-green-200 text-green-800 px-2 py-1 rounded">WINNER</span>}
                                  </p>
                                  <p className="text-sm text-gray-600">{candidate.party}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`text-2xl font-bold ${candidate.isWinner ? 'text-green-900' : 'text-gray-900'}`}>
                                  {candidate.voteCount}
                                </p>
                                <p className="text-sm text-gray-600">votes</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No votes have been cast yet.
              </div>
            )
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Results will be available after {resultsTime}</p>
              <p className="text-sm mt-2">Current status: {timeStatus.message}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}