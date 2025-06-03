import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { insertCandidateSchema, type Candidate, type InsertCandidate } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/ui/file-upload';

const constituencies = [
  'Central Delhi', 'East Delhi', 'North Delhi', 'South Delhi', 'West Delhi',
  'Mumbai North', 'Mumbai South', 'Mumbai Central', 
  'Bangalore North', 'Bangalore South', 'Bangalore Central',
  'Chennai North', 'Chennai South', 'Chennai Central',
  'Coimbatore', 'Madurai', 'Salem', 'Tiruchirapalli', 'Tirunelveli',
  'Vellore', 'Erode', 'Tiruppur', 'Dindigul', 'Thanjavur',
  'Cuddalore', 'Nagapattinam', 'Mayiladuthurai', 'Ariyalur'
];

interface CandidateFormProps {
  candidate?: Candidate;
  onSuccess: () => void;
  onCancel: () => void;
}

function CandidateForm({ candidate, onSuccess, onCancel }: CandidateFormProps) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<InsertCandidate>({
    resolver: zodResolver(insertCandidateSchema),
    defaultValues: {
      name: candidate?.name || '',
      party: candidate?.party || '',
      constituency: candidate?.constituency || '',
      symbol: candidate?.symbol || '',
      manifesto: candidate?.manifesto || '',
      electionId: 1 // Default to the current election
    }
  });

  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/candidates', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create candidate');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
      toast({ title: 'Success', description: 'Candidate created successfully' });
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Candidate creation error:', error);
      const errorMessage = error.message || 'Failed to create candidate';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
      const response = await fetch(`/api/candidates/${id}`, {
        method: 'PATCH',
        body: formData
      });
      if (!response.ok) throw new Error('Failed to update candidate');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
      toast({ title: 'Success', description: 'Candidate updated successfully' });
      onSuccess();
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to update candidate', variant: 'destructive' });
    }
  });

  const onSubmit = async (data: InsertCandidate) => {
    const formData = new FormData();
    
    // Only append non-empty required fields
    if (data.name) formData.append('name', data.name);
    if (data.party) formData.append('party', data.party);
    if (data.constituency) formData.append('constituency', data.constituency);
    if (data.symbol) formData.append('symbol', data.symbol);
    if (data.manifesto) formData.append('manifesto', data.manifesto);
    formData.append('electionId', '1'); // Current election

    if (selectedFile) {
      formData.append('photo', selectedFile);
    }

    if (candidate) {
      updateMutation.mutate({ id: candidate.id, formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Candidate Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter candidate name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="party"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Political Party</FormLabel>
              <FormControl>
                <Input placeholder="Enter party name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="constituency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Constituency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select constituency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {constituencies.map((constituency) => (
                    <SelectItem key={constituency} value={constituency}>
                      {constituency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="symbol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Election Symbol</FormLabel>
              <FormControl>
                <Input placeholder="Enter election symbol" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="manifesto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Manifesto</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter candidate manifesto and key promises"
                  className="min-h-[100px]"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Label>Candidate Photo</Label>
          <FileUpload
            onFileSelect={setSelectedFile}
            accept="image/*"
            maxSize={5 * 1024 * 1024} // 5MB
          />
          {candidate?.photoUrl && !selectedFile && (
            <div className="text-sm text-gray-500">
              Current photo will be kept if no new photo is uploaded
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending 
              ? 'Saving...' 
              : candidate ? 'Update Candidate' : 'Add Candidate'
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function CandidateManagement() {
  const { toast } = useToast();
  const [selectedConstituency, setSelectedConstituency] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ['/api/candidates', selectedConstituency],
    queryFn: async () => {
      const url = selectedConstituency && selectedConstituency !== 'all'
        ? `/api/candidates?constituency=${encodeURIComponent(selectedConstituency)}`
        : '/api/candidates';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch candidates');
      return response.json();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/candidates/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete candidate');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
      toast({ title: 'Success', description: 'Candidate deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete candidate', variant: 'destructive' });
    }
  });

  const handleDelete = (candidate: Candidate) => {
    if (confirm(`Are you sure you want to delete ${candidate.name}?`)) {
      deleteMutation.mutate(candidate.id);
    }
  };

  const handleEdit = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingCandidate(null);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingCandidate(null);
  };

  const groupedCandidates = candidates.reduce((acc: Record<string, Candidate[]>, candidate: Candidate) => {
    if (!acc[candidate.constituency]) {
      acc[candidate.constituency] = [];
    }
    acc[candidate.constituency].push(candidate);
    return acc;
  }, {} as Record<string, Candidate[]>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Candidate Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4 items-center">
              <Label>Filter by Constituency:</Label>
              <Select value={selectedConstituency} onValueChange={setSelectedConstituency}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="All Constituencies" />
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
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAddNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Candidate
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingCandidate ? 'Edit Candidate' : 'Add New Candidate'}
                  </DialogTitle>
                </DialogHeader>
                <div className="max-h-[calc(90vh-8rem)] overflow-y-auto pr-2">
                  <CandidateForm
                    candidate={editingCandidate || undefined}
                    onSuccess={handleDialogClose}
                    onCancel={handleDialogClose}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading candidates...</div>
          ) : Object.keys(groupedCandidates).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No candidates found. Add your first candidate to get started.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedCandidates).map(([constituency, constituencyCandidates]) => (
                <div key={constituency} className="space-y-2">
                  <h3 className="text-lg font-semibold border-b pb-2">
                    {constituency} ({(constituencyCandidates as Candidate[]).length} candidates)
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Photo</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Party</TableHead>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Manifesto</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(constituencyCandidates as Candidate[]).map((candidate: Candidate) => (
                        <TableRow key={candidate.id}>
                          <TableCell>
                            {candidate.photoUrl ? (
                              <img 
                                src={candidate.photoUrl} 
                                alt={candidate.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                <Users className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{candidate.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{candidate.party}</Badge>
                          </TableCell>
                          <TableCell>{candidate.symbol}</TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate" title={candidate.manifesto || ''}>
                              {candidate.manifesto || 'No manifesto provided'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(candidate)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(candidate)}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}