import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, Search, Shield, Info } from "lucide-react";
import type { Citizen } from "@shared/schema";

interface VerificationResultProps {
  citizen: Citizen;
  onNewSearch: () => void;
}

export function VerificationResult({ citizen, onNewSearch }: VerificationResultProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatAadharDisplay = (aadharNumber: string) => {
    // Show only last 4 digits for privacy in public portal
    return `XXXX-XXXX-${aadharNumber.slice(-4)}`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="shadow-xl border-0">
      <CardHeader className="text-center pb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">Verification Successful</CardTitle>
        <p className="text-gray-600">Your details have been verified successfully</p>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Citizen Photo */}
          <div className="text-center">
            <Avatar className="w-48 h-60 mx-auto mb-4 rounded-lg">
              <AvatarImage 
                src={citizen.photoUrl || undefined} 
                className="object-cover rounded-lg"
              />
              <AvatarFallback className="w-48 h-60 bg-blue-100 text-blue-600 text-4xl rounded-lg">
                {getInitials(citizen.name)}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm text-gray-600">Registered Photo</p>
          </div>

          {/* Citizen Details */}
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-3">
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="text-lg font-semibold text-gray-900">{citizen.name}</p>
            </div>
            
            <div className="border-b border-gray-200 pb-3">
              <p className="text-sm text-gray-600">Aadhar Number</p>
              <p className="text-lg font-mono text-gray-900">{formatAadharDisplay(citizen.aadharNumber)}</p>
            </div>
            
            <div className="border-b border-gray-200 pb-3">
              <p className="text-sm text-gray-600">Date of Birth</p>
              <p className="text-lg text-gray-900">{formatDate(citizen.dateOfBirth)}</p>
            </div>
            
            <div className="border-b border-gray-200 pb-3">
              <p className="text-sm text-gray-600">Gender</p>
              <p className="text-lg text-gray-900 capitalize">{citizen.gender}</p>
            </div>
            
            <div className="border-b border-gray-200 pb-3">
              <p className="text-sm text-gray-600">Address</p>
              <p className="text-lg text-gray-900">{citizen.address}</p>
            </div>
            
            <div className="border-b border-gray-200 pb-3">
              <p className="text-sm text-gray-600">District</p>
              <p className="text-lg text-gray-900">{citizen.district}</p>
            </div>
            
            <div className="border-b border-gray-200 pb-3">
              <p className="text-sm text-gray-600">Pincode</p>
              <p className="text-lg text-gray-900">{citizen.pincode}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Verification Status</p>
              <Badge className="bg-green-100 text-green-800 mt-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                {citizen.status === "active" ? "Verified & Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <Card className="bg-blue-50 border-blue-200 mb-6">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Info className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Important Information</h4>
                <p className="text-sm text-blue-800">
                  This verification is for informational purposes only. For official government 
                  services, please visit your nearest Aadhar enrollment center with original documents.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New Search Button */}
        <div className="text-center">
          <Button 
            onClick={onNewSearch}
            variant="outline"
            className="px-6 py-3 border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <Search className="w-4 h-4 mr-2" />
            Perform New Search
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
