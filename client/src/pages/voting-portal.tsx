import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VoterRegistrationForm } from "@/components/voting/voter-registration-form";
import { VotingForm } from "@/components/voting/voting-form";
import { ElectionResults } from "@/components/voting/election-results";
import { Vote, Users, TrendingUp, ArrowRight } from "lucide-react";

type VotingSection = "register" | "vote" | "results";

export default function VotingPortal() {
  const [, setLocation] = useLocation();
  const [currentSection, setCurrentSection] = useState<VotingSection | null>(null);

  const handleSectionSelect = (section: VotingSection) => {
    setCurrentSection(section);
  };

  const handleBackToHome = () => {
    setCurrentSection(null);
  };

  if (currentSection === "register") {
    return <VoterRegistrationForm onBack={handleBackToHome} />;
  }

  if (currentSection === "vote") {
    return <VotingForm onBack={handleBackToHome} />;
  }

  if (currentSection === "results") {
    return <ElectionResults onBack={handleBackToHome} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Vote className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Digital Voting Portal</h1>
                <p className="text-sm text-gray-500">Government of India - Election Commission</p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <Button 
                variant="outline"
                onClick={() => setLocation("/public")}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                Aadhar Portal
              </Button>
              <Button 
                variant="outline"
                onClick={() => setLocation("/admin")}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                Admin Portal
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Vote className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Digital Voting System</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Secure, transparent, and accessible voting platform powered by Aadhar verification. 
            Exercise your democratic right with confidence and convenience.
          </p>
        </div>

        {/* Voting Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card 
            className="shadow-xl border-0 cursor-pointer hover:shadow-2xl transition-shadow duration-300"
            onClick={() => handleSectionSelect("register")}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Voter Registration</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Register as a voter using your Aadhar details. One-time registration process 
                to enable voting in all future elections.
              </p>
              <Button className="w-full btn-primary">
                Register Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="shadow-xl border-0 cursor-pointer hover:shadow-2xl transition-shadow duration-300"
            onClick={() => handleSectionSelect("vote")}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Vote className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Cast Your Vote</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Vote securely in active elections. Your vote is encrypted and anonymous, 
                ensuring complete privacy and transparency.
              </p>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                Vote Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="shadow-xl border-0 cursor-pointer hover:shadow-2xl transition-shadow duration-300"
            onClick={() => handleSectionSelect("results")}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Election Results</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                View real-time election results and statistics. Transparent reporting 
                with detailed vote counts and constituency-wise data.
              </p>
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                View Results
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Vote className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Secure Voting Process</h4>
                  <p className="text-sm text-blue-800">
                    Our voting system uses advanced encryption and Aadhar-based verification to ensure 
                    your vote is secure, anonymous, and counted accurately. Each vote is cryptographically 
                    protected and linked to verified citizen identity.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-900 mb-2">Aadhar Integration</h4>
                  <p className="text-sm text-green-800">
                    Seamlessly integrated with the Aadhar management system for instant voter verification. 
                    Your existing Aadhar registration serves as the foundation for secure democratic participation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Election Status */}
        <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">General Election 2024 - NOW ACTIVE</h3>
            <p className="text-lg opacity-90 mb-6">
              National Parliamentary Election is currently open for voting. 
              Make your voice heard in shaping the future of our nation.
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-green-600"
                onClick={() => handleSectionSelect("vote")}
              >
                Vote Now
              </Button>
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-blue-600"
                onClick={() => handleSectionSelect("results")}
              >
                View Live Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}