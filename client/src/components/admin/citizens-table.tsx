import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCitizens } from "@/hooks/use-citizens";
import { Search, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import type { Citizen } from "@shared/schema";

export function CitizensTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [viewingCitizen, setViewingCitizen] = useState<Citizen | null>(null);
  const [editingCitizen, setEditingCitizen] = useState<Citizen | null>(null);
  const { toast } = useToast();
  
  const { 
    citizens, 
    isLoading, 
    deleteCitizen 
  } = useCitizens({
    search: searchQuery,
    district: selectedDistrict,
    gender: selectedGender
  });

  const handleDelete = async (citizen: Citizen) => {
    if (window.confirm(`Are you sure you want to delete ${citizen.name}'s record?`)) {
      try {
        await deleteCitizen.mutateAsync(citizen.id);
        toast({
          title: "Citizen Deleted",
          description: `${citizen.name}'s record has been removed.`,
        });
      } catch (error: any) {
        toast({
          title: "Delete Failed",
          description: error.message || "Failed to delete citizen record.",
          variant: "destructive"
        });
      }
    }
  };

  const handleSearch = () => {
    // The search is reactive, so this is just for the button click
    // The actual search happens automatically when searchQuery changes
  };

  const formatAadharDisplay = (aadharNumber: string) => {
    // Show only last 4 digits for privacy
    return `XXXX-XXXX-${aadharNumber.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="card-shadow">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-gray-200 rounded w-full"></div>
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-shadow">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Search Citizens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search by name or Aadhar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-focus"
              />
            </div>
            <div>
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="input-focus">
                  <SelectValue placeholder="All Districts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  <SelectItem value="Mumbai">Mumbai</SelectItem>
                  <SelectItem value="Delhi">Delhi</SelectItem>
                  <SelectItem value="Bangalore">Bangalore</SelectItem>
                  <SelectItem value="Chennai">Chennai</SelectItem>
                  <SelectItem value="Kolkata">Kolkata</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={selectedGender} onValueChange={setSelectedGender}>
                <SelectTrigger className="input-focus">
                  <SelectValue placeholder="All Genders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button onClick={handleSearch} className="w-full btn-primary">
                <Search className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Citizens Table */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle>Citizen Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Photo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Aadhar Number</TableHead>
                  <TableHead>DOB</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {citizens?.map((citizen) => (
                  <TableRow key={citizen.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={citizen.photoUrl || undefined} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {getInitials(citizen.name)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{citizen.name}</p>
                        <p className="text-sm text-gray-500 capitalize">{citizen.gender}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatAadharDisplay(citizen.aadharNumber)}
                    </TableCell>
                    <TableCell>{formatDate(citizen.dateOfBirth)}</TableCell>
                    <TableCell>{citizen.district}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={citizen.status === "active" ? "default" : "secondary"}
                        className={citizen.status === "active" ? "bg-green-100 text-green-800" : ""}
                      >
                        {citizen.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingCitizen(citizen)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCitizen(citizen)}
                          className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(citizen)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {citizens && citizens.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No citizens found matching your criteria.</p>
            </div>
          )}
          
          {/* Pagination */}
          {citizens && citizens.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Showing {citizens.length} of {citizens.length} results
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" className="bg-blue-600 text-white">
                    1
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Citizen Dialog */}
      <Dialog open={!!viewingCitizen} onOpenChange={() => setViewingCitizen(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Citizen Details</DialogTitle>
          </DialogHeader>
          {viewingCitizen && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm">{viewingCitizen.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Aadhar Number</Label>
                  <p className="text-sm">{viewingCitizen.aadharNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date of Birth</Label>
                  <p className="text-sm">{viewingCitizen.dateOfBirth}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Gender</Label>
                  <p className="text-sm">{viewingCitizen.gender}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">District</Label>
                  <p className="text-sm">{viewingCitizen.district}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Address</Label>
                  <p className="text-sm">{viewingCitizen.address}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm">{viewingCitizen.phoneNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant={viewingCitizen.status === "active" ? "default" : "secondary"}>
                    {viewingCitizen.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              {viewingCitizen.photoUrl && (
                <div className="col-span-2">
                  <Label className="text-sm font-medium">Photo</Label>
                  <Avatar className="w-24 h-24 mt-2">
                    <AvatarImage src={viewingCitizen.photoUrl} />
                    <AvatarFallback>{viewingCitizen.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Citizen Dialog */}
      <Dialog open={!!editingCitizen} onOpenChange={() => setEditingCitizen(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Citizen</DialogTitle>
          </DialogHeader>
          {editingCitizen && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Name</Label>
                  <Input id="edit-name" defaultValue={editingCitizen.name} />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Phone Number</Label>
                  <Input id="edit-phone" defaultValue={editingCitizen.phoneNumber} />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-address">Address</Label>
                <Input id="edit-address" defaultValue={editingCitizen.address} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingCitizen(null)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast({ title: "Update Successful", description: "Citizen record updated successfully" });
                  setEditingCitizen(null);
                }}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
