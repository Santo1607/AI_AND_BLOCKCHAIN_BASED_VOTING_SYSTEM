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
import { Search, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Users } from "lucide-react";
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
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-4">
          <CardTitle className="text-gray-800 flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            Search & Filter Citizens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name or Aadhar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-200 focus:border-blue-400 focus:ring-blue-400 transition-all duration-200"
              />
            </div>
            <div>
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="border-gray-200 focus:border-blue-400 focus:ring-blue-400 transition-all duration-200">
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
                <SelectTrigger className="border-gray-200 focus:border-blue-400 focus:ring-blue-400 transition-all duration-200">
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
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center text-gray-800">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Citizen Records ({citizens?.length || 0})
            </span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Total: {citizens?.length || 0}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors">
                  <TableHead className="font-semibold text-gray-700">Photo</TableHead>
                  <TableHead className="font-semibold text-gray-700">Name</TableHead>
                  <TableHead className="font-semibold text-gray-700">Aadhar Number</TableHead>
                  <TableHead className="font-semibold text-gray-700">DOB</TableHead>
                  <TableHead className="font-semibold text-gray-700">District</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {citizens?.map((citizen) => (
                  <TableRow key={citizen.id} className="hover:bg-blue-50 transition-colors duration-200 border-b border-gray-100">
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
                      <div className="flex justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingCitizen(citizen)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 hover:scale-105 transition-all duration-200 p-2"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCitizen(citizen)}
                          className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 hover:scale-105 transition-all duration-200 p-2"
                          title="Edit Citizen"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(citizen)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:scale-105 transition-all duration-200 p-2"
                          title="Delete Citizen"
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
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50">
              <div className="bg-white p-8 rounded-lg shadow-sm max-w-md mx-auto">
                <Search className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Citizens Found</h3>
                <p className="text-gray-600">No citizens match your current search criteria. Try adjusting your filters or search terms.</p>
                <Button 
                  variant="outline" 
                  className="mt-4 border-blue-200 text-blue-600 hover:bg-blue-50"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedDistrict("");
                    setSelectedGender("");
                    handleSearch();
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
          
          {/* Pagination */}
          {citizens && citizens.length > 0 && (
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-700 font-medium">
                  Showing <span className="text-blue-600 font-semibold">{citizens.length}</span> of <span className="text-blue-600 font-semibold">{citizens.length}</span> citizens
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" disabled className="border-gray-300 text-gray-400">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700">
                    1
                  </Button>
                  <Button variant="outline" size="sm" disabled className="border-gray-300 text-gray-400">
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
                  <Label className="text-sm font-medium">Pincode</Label>
                  <p className="text-sm">{viewingCitizen.pincode}</p>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Citizen Details</DialogTitle>
          </DialogHeader>
          {editingCitizen && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input id="edit-name" defaultValue={editingCitizen.name} />
                </div>
                <div>
                  <Label htmlFor="edit-aadhar">Aadhar Number</Label>
                  <Input id="edit-aadhar" defaultValue={editingCitizen.aadharNumber} disabled />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-dob">Date of Birth</Label>
                  <Input id="edit-dob" type="date" defaultValue={editingCitizen.dateOfBirth} />
                </div>
                <div>
                  <Label htmlFor="edit-gender">Gender</Label>
                  <Select defaultValue={editingCitizen.gender}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-pincode">Pincode</Label>
                  <Input id="edit-pincode" defaultValue={editingCitizen.pincode} />
                </div>
                <div>
                  <Label htmlFor="edit-district">District</Label>
                  <Select defaultValue={editingCitizen.district}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Central Delhi">Central Delhi</SelectItem>
                      <SelectItem value="East Delhi">East Delhi</SelectItem>
                      <SelectItem value="North Delhi">North Delhi</SelectItem>
                      <SelectItem value="South Delhi">South Delhi</SelectItem>
                      <SelectItem value="West Delhi">West Delhi</SelectItem>
                      <SelectItem value="Mumbai">Mumbai</SelectItem>
                      <SelectItem value="Bangalore">Bangalore</SelectItem>
                      <SelectItem value="Chennai">Chennai</SelectItem>
                      <SelectItem value="Coimbatore">Coimbatore</SelectItem>
                      <SelectItem value="Kolkata">Kolkata</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-address">Full Address</Label>
                <Input id="edit-address" defaultValue={editingCitizen.address} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-constituency">Constituency</Label>
                  <Select defaultValue={editingCitizen.constituency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Central Delhi">Central Delhi</SelectItem>
                      <SelectItem value="East Delhi">East Delhi</SelectItem>
                      <SelectItem value="North Delhi">North Delhi</SelectItem>
                      <SelectItem value="South Delhi">South Delhi</SelectItem>
                      <SelectItem value="West Delhi">West Delhi</SelectItem>
                      <SelectItem value="Mumbai North">Mumbai North</SelectItem>
                      <SelectItem value="Mumbai South">Mumbai South</SelectItem>
                      <SelectItem value="Bangalore North">Bangalore North</SelectItem>
                      <SelectItem value="Bangalore South">Bangalore South</SelectItem>
                      <SelectItem value="Chennai Central">Chennai Central</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select defaultValue={editingCitizen.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  onClick={() => setEditingCitizen(null)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    toast({ title: "Update Successful", description: "Citizen record updated successfully" });
                    setEditingCitizen(null);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
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
