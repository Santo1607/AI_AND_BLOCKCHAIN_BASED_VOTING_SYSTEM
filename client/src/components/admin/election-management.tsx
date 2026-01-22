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
import { getStates, INDIAN_LOCATIONS } from "@/lib/locations";

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const formattedHour = h % 12 || 12;
  return `${formattedHour}:${minutes} ${ampm}`;
};

// Use dynamic constituencies from locations.ts instead of hardcoded list
const constituencies = Object.values(INDIAN_LOCATIONS).flat().sort();

export function ElectionManagement() {
  const [selectedElectionId, setSelectedElectionId] = useState<number | null>(null);
  const [editingElection, setEditingElection] = useState<Election | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [electionTitle, setElectionTitle] = useState("");
  const [electionDescription, setElectionDescription] = useState("");
  const [electionStartDate, setElectionStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [electionEndDate, setElectionEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [blockchainAddress, setBlockchainAddress] = useState("0x1234567890123456789012345678901234567890");
  const [votingStartTime, setVotingStartTime] = useState("08:00");
  const [votingEndTime, setVotingEndTime] = useState("17:00");
  const [resultsTime, setResultsTime] = useState("18:00");
  const [selectedConstituency, setSelectedConstituency] = useState<string>("all");

  // Location States
  const [electionScope, setElectionScope] = useState<"State" | "Constituency">("State");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedConstituencyFromList, setSelectedConstituencyFromList] = useState<string>("");
  const [availableConstituencies, setAvailableConstituencies] = useState<string[]>([]);

  const { toast } = useToast();

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setAvailableConstituencies(INDIAN_LOCATIONS[state] || []);
    setSelectedConstituencyFromList("");
  };

  const { data: elections, isLoading: electionsLoading } = useQuery<Election[]>({
    queryKey: ['/api/elections'],
    queryFn: () => apiRequest("GET", "/api/elections").then(res => res.json())
  });

  // Set default selected election if not set
  if (!selectedElectionId && elections && elections.length > 0) {
    setSelectedElectionId(elections[0].id);
  }

  const { data: constituencyResults, isLoading: resultsLoading } = useQuery({
    queryKey: [`/api/elections/${selectedElectionId}/constituency-results`],
    queryFn: async () => {
      if (!selectedElectionId) return null;
      try {
        const response = await apiRequest("GET", `/api/elections/${selectedElectionId}/constituency-results`);
        return await response.json();
      } catch (error) {
        return { constituencyResults: {}, overallWinner: null, totalVotes: 0 };
      }
    },
    enabled: !!selectedElectionId
  });

  const updateElectionMutation = useMutation({
    mutationFn: async (data: { id: number; updates: any }) => {
      const response = await apiRequest("PATCH", `/api/elections/${data.id}`, data.updates);
      if (!response.ok) throw new Error('Failed to update election');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/elections'] });
      toast({ title: 'Success', description: 'Election updated successfully' });
      setEditingElection(null);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update election', variant: 'destructive' });
    }
  });

  const createElectionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/elections", data);
      if (!response.ok) throw new Error('Failed to create election');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/elections'] });
      toast({ title: 'Success', description: 'New election created successfully' });
      setIsCreating(false);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create election', variant: 'destructive' });
    }
  });

  const handleSaveElection = () => {
    if (!editingElection) return;

    updateElectionMutation.mutate({
      id: editingElection.id,
      updates: {
        title: electionTitle,
        description: electionDescription,
        startDate: electionStartDate,
        endDate: electionEndDate,
        votingStartTime,
        votingEndTime,
        resultsTime,
        blockchainAddress
      }
    });
  };

  const handleCreateElection = () => {
    if (!selectedState) {
      toast({ title: 'Error', description: 'Please select a state', variant: 'destructive' });
      return;
    }
    if (electionScope === "Constituency" && !selectedConstituencyFromList) {
      toast({ title: 'Error', description: 'Please select a constituency', variant: 'destructive' });
      return;
    }

    createElectionMutation.mutate({
      title: electionTitle,
      description: electionDescription,
      startDate: electionStartDate,
      endDate: electionEndDate,
      votingStartTime,
      votingEndTime,
      resultsTime,
      blockchainAddress,
      status: 'upcoming',
      electionScope,
      state: selectedState,
      constituency: electionScope === "Constituency" ? selectedConstituencyFromList : null
    });
  };

  const startEditing = (election: Election) => {
    setEditingElection(election);
    setElectionTitle(election.title);
    setElectionDescription(election.description);
    setElectionStartDate(election.startDate);
    setElectionEndDate(election.endDate);
    setVotingStartTime(election.votingStartTime || "08:00");
    setVotingEndTime(election.votingEndTime || "17:00");
    setResultsTime(election.resultsTime || "18:00");
    setBlockchainAddress(election.blockchainAddress || "0x1234567890123456789012345678901234567890");
  };

  const startCreating = () => {
    setIsCreating(true);
    setElectionTitle("");
    setElectionDescription("");
    setElectionStartDate(new Date().toISOString().split('T')[0]);
    setElectionEndDate(new Date().toISOString().split('T')[0]);
    setVotingStartTime("08:00");
    setVotingEndTime("17:00");
    setResultsTime("18:00");
    setBlockchainAddress("0x1234567890123456789012345678901234567890");
  };

  const currentElection = elections?.find(e => e.id === selectedElectionId);

  // Time status calculation
  const getCurrentTimeStatus = () => {
    if (!currentElection) {
      return { status: 'pending', message: 'No election selected', color: 'bg-gray-500' };
    }

    const now = new Date();
    // Use Indian Standard Time (IST)
    const istNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const currentHour = istNow.getHours();
    const currentMin = istNow.getMinutes();
    const currentTimeInMin = currentHour * 60 + currentMin;

    const votingStartTimeStr = currentElection.votingStartTime || "08:00";
    const votingEndTimeStr = currentElection.votingEndTime || "17:00";
    const resultsTimeStr = currentElection.resultsTime || "18:00";

    const [vStartH, vStartM] = votingStartTimeStr.split(':').map(Number);
    const [vEndH, vEndM] = votingEndTimeStr.split(':').map(Number);
    const [rStartH, rStartM] = resultsTimeStr.split(':').map(Number);

    const votingStartInMin = vStartH * 60 + vStartM;
    const votingEndInMin = vEndH * 60 + vEndM;
    const resultsStartInMin = rStartH * 60 + rStartM;

    if (currentTimeInMin < votingStartInMin) {
      return { status: 'pending', message: 'Voting not yet started', color: 'bg-gray-500' };
    } else if (currentTimeInMin >= votingStartInMin && currentTimeInMin < votingEndInMin) {
      return { status: 'active', message: 'Voting in progress', color: 'bg-green-600' };
    } else if (currentTimeInMin >= votingEndInMin && currentTimeInMin < resultsStartInMin) {
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

  const partyStats = constituencyResults ? getPartyWiseResults(constituencyResults) : [];
  const filteredResults = getFilteredResults();

  return (
    <div className="space-y-6">
      {/* Election Selector & Actions */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center space-x-4">
          <Vote className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">Manage Election:</h3>
          <Select
            value={selectedElectionId?.toString()}
            onValueChange={(val) => setSelectedElectionId(parseInt(val))}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select Election" />
            </SelectTrigger>
            <SelectContent>
              {elections?.map(election => (
                <SelectItem key={election.id} value={election.id.toString()}>
                  {election.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={startCreating} className="bg-green-600 hover:bg-green-700">
          <Vote className="w-4 h-4 mr-2" />
          Create New Election
        </Button>
      </div>

      {isCreating && (
        <Card className="border-2 border-green-200 shadow-lg">
          <CardHeader className="bg-green-50">
            <CardTitle>Create New Election</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-title">Election Title</Label>
                  <Input id="create-title" value={electionTitle} onChange={(e) => setElectionTitle(e.target.value)} placeholder="e.g. 2024 General Elections" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-blockchain">Blockchain Contract Address</Label>
                  <Input id="create-blockchain" value={blockchainAddress} onChange={(e) => setBlockchainAddress(e.target.value)} placeholder="0x..." />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-desc">Description</Label>
                <textarea
                  id="create-desc"
                  className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={electionDescription}
                  onChange={(e) => setElectionDescription(e.target.value)}
                  placeholder="Describe the election purpose and scope..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-start">Start Date</Label>
                  <Input id="create-start" type="date" value={electionStartDate} onChange={(e) => setElectionStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-end">End Date</Label>
                  <Input id="create-end" type="date" value={electionEndDate} onChange={(e) => setElectionEndDate(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-v-start">Voting Start Time</Label>
                  <Input id="create-v-start" type="time" value={votingStartTime} onChange={(e) => setVotingStartTime(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-v-end">Voting End Time</Label>
                  <Input id="create-v-end" type="time" value={votingEndTime} onChange={(e) => setVotingEndTime(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-r-start">Results Time</Label>
                  <Input id="create-r-start" type="time" value={resultsTime} onChange={(e) => setResultsTime(e.target.value)} />
                </div>
              </div>
              <div className="space-y-4 border-t pt-4 mt-4">
                <h4 className="font-semibold text-gray-900">Election Location & Scope</h4>

                <div className="space-y-2">
                  <Label>Election Scope</Label>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="scope-state"
                        value="State"
                        checked={electionScope === "State"}
                        onChange={(e) => setElectionScope(e.target.value as "State" | "Constituency")}
                        className="w-4 h-4 text-green-600"
                      />
                      <Label htmlFor="scope-state">State Level</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="scope-constituency"
                        value="Constituency"
                        checked={electionScope === "Constituency"}
                        onChange={(e) => setElectionScope(e.target.value as "State" | "Constituency")}
                        className="w-4 h-4 text-green-600"
                      />
                      <Label htmlFor="scope-constituency">Constituency Level</Label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-state">State</Label>
                    <Select value={selectedState} onValueChange={handleStateChange}>
                      <SelectTrigger id="create-state">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        {getStates().map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {electionScope === "Constituency" && (
                    <div className="space-y-2">
                      <Label htmlFor="create-constituency">Constituency</Label>
                      <Select value={selectedConstituencyFromList} onValueChange={setSelectedConstituencyFromList}>
                        <SelectTrigger id="create-constituency" disabled={!selectedState}>
                          <SelectValue placeholder="Select Constituency" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableConstituencies.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 pt-6 border-t mt-4">
                <Button onClick={handleCreateElection} className="bg-green-600 hover:bg-green-700 w-full md:w-auto" disabled={createElectionMutation.isPending}>
                  {createElectionMutation.isPending ? 'Creating...' : 'Launch Election'}
                </Button>
                <Button variant="outline" onClick={() => setIsCreating(false)} className="w-full md:w-auto">Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                  className={`${timeStatus.status === 'active' ? 'bg-green-600' :
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
                <p>Voting: {currentElection ? `${formatTime(currentElection.votingStartTime || "08:00")} - ${formatTime(currentElection.votingEndTime || "17:00")}` : 'Select an election'}</p>
                <p>Results: {currentElection ? `${formatTime(currentElection.resultsTime || "18:00")} onwards` : 'Select an election'}</p>
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
                onClick={() => startEditing(currentElection!)}
                className="w-full"
                disabled={!currentElection}
              >
                <Settings className="w-4 h-4 mr-2" />
                Configure Details
              </Button>
            </div>
          </div>

          {editingElection && (
            <div className="mt-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold mb-4 text-blue-900">Configure Election Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Election Title</Label>
                    <Input id="edit-title" value={electionTitle} onChange={(e) => setElectionTitle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-blockchain">Blockchain Address</Label>
                    <Input id="edit-blockchain" value={blockchainAddress} onChange={(e) => setBlockchainAddress(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-desc">Description</Label>
                  <textarea
                    id="edit-desc"
                    className="w-full min-h-[80px] p-3 rounded-md border border-input bg-background text-sm"
                    value={electionDescription}
                    onChange={(e) => setElectionDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-start">Start Date</Label>
                    <Input id="edit-start" type="date" value={electionStartDate} onChange={(e) => setElectionStartDate(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="edit-end">End Date</Label>
                    <Input id="edit-end" type="date" value={electionEndDate} onChange={(e) => setElectionEndDate(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-vstart">Voting Start</Label>
                    <Input id="edit-vstart" type="time" value={votingStartTime} onChange={(e) => setVotingStartTime(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="edit-vend">Voting End</Label>
                    <Input id="edit-vend" type="time" value={votingEndTime} onChange={(e) => setVotingEndTime(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="edit-rtime">Results Time</Label>
                    <Input id="edit-rtime" type="time" value={resultsTime} onChange={(e) => setResultsTime(e.target.value)} />
                  </div>
                </div>
                <div className="flex space-x-3 mt-4">
                  <Button onClick={handleSaveElection} disabled={updateElectionMutation.isPending}>
                    {updateElectionMutation.isPending ? 'Saving...' : 'Update Configuration'}
                  </Button>
                  <Button variant="outline" onClick={() => setEditingElection(null)}>Cancel</Button>
                </div>
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
                          <div key={party.party} className={`p-4 rounded-lg border ${index === 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
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
                              <div key={candidate.candidateId} className={`p-4 rounded-lg border ${candidate.isWinner ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                                }`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${candidate.isWinner ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'
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
                {timeStatus.status === 'pending' && `Voting has not started yet. Results will be available after ${formatTime(currentElection?.resultsTime || "18:00")}.`}
                {timeStatus.status === 'active' && `Voting is currently in progress. Results will be available after ${formatTime(currentElection?.resultsTime || "18:00")}.`}
                {timeStatus.status === 'ended' && `Voting has ended. Results will be available starting at ${formatTime(currentElection?.resultsTime || "18:00")}.`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}