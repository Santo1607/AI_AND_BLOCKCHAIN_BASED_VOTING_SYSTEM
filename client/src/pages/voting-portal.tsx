import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VoterRegistrationForm } from "@/components/voting/voter-registration-form";
import { VotingForm } from "@/components/voting/voting-form";
import { ElectionResults } from "@/components/voting/election-results";
import { BiometricVerification } from "@/components/voting/biometric-verification";
import { AgeVerification } from "@/components/age-verification";
import { LanguageSelectorButton } from "@/components/language-selector";
import { SecurityChallenge } from "@/components/recaptcha";
import { useLanguage } from "@/hooks/use-language";
import { Vote, Users, TrendingUp, ArrowRight, Clock, AlertCircle, Globe, Shield } from "lucide-react";

type VotingSection = "register" | "vote" | "results";

export default function VotingPortal() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [currentSection, setCurrentSection] = useState<VotingSection | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [votingStatus, setVotingStatus] = useState({
    isVotingTime: false,
    canViewResults: false,
    message: ""
  });
  const [ageVerified, setAgeVerified] = useState<boolean>(false);
  const [securityVerified, setSecurityVerified] = useState<boolean>(false);
  const [showAgeVerification, setShowAgeVerification] = useState<boolean>(true);

  const { data: elections } = useQuery({
    queryKey: ['/api/elections'],
    queryFn: () => fetch('/api/elections').then(res => res.json())
  });

  useEffect(() => {
    const updateTime = () => {
      // Use Indian Standard Time (IST)
      const istTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
      const now = new Date(istTime);
      setCurrentTime(now);
      
      const activeElection = elections?.[0];
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;
      
      // Parse election timing
      const votingStartTime = activeElection?.votingStartTime || "08:00";
      const votingEndTime = activeElection?.votingEndTime || "17:00";
      const resultsTime = activeElection?.resultsTime || "18:00";
      
      const [startHour, startMin] = votingStartTime.split(':').map(Number);
      const [endHour, endMin] = votingEndTime.split(':').map(Number);
      const [resultHour, resultMin] = resultsTime.split(':').map(Number);
      
      const startTimeInMinutes = startHour * 60 + startMin;
      const endTimeInMinutes = endHour * 60 + endMin;
      const resultTimeInMinutes = resultHour * 60 + resultMin;
      
      const isVotingTime = currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes;
      const canViewResults = currentTimeInMinutes >= resultTimeInMinutes;
      
      let message = "";
      if (currentTimeInMinutes < startTimeInMinutes) {
        message = `Voting will start at ${votingStartTime}. Please come back during voting hours.`;
      } else if (isVotingTime) {
        message = "Voting is currently active. You can cast your vote now.";
      } else if (currentTimeInMinutes >= endTimeInMinutes && currentTimeInMinutes < resultTimeInMinutes) {
        message = `Voting has ended. Results will be available at ${resultsTime}.`;
      } else {
        message = "Voting has ended. Election results are now available.";
      }
      
      setVotingStatus({ isVotingTime, canViewResults, message });
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [elections]);

  const handleSectionSelect = (section: VotingSection) => {
    if (section === "vote" && !votingStatus.isVotingTime) {
      return; // Prevent voting outside allowed hours
    }
    if (section === "results" && !votingStatus.canViewResults) {
      return; // Prevent viewing results before 6 PM
    }
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
                <h1 className="text-xl font-semibold text-gray-900">{t('digitalVotingPortal')}</h1>
                <p className="text-sm text-gray-500">{t('governmentOfIndia')}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <LanguageSelectorButton />
              <Button 
                variant="outline"
                onClick={() => setLocation("/public")}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                {t('publicPortal')}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setLocation("/admin")}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                {t('adminPortal')}
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('digitalVotingSystem')}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('votingPlatformDescription')}
          </p>
        </div>

        {/* Voting Schedule & Status */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-3">
                  <Clock className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('electionSchedule')}</h3>
                    <p className="text-sm text-gray-600">
                      {t('voteNow')}: {elections?.[0]?.votingStartTime || '08:00'} - {elections?.[0]?.votingEndTime || '17:00'} | {t('viewResultsTitle')}: {elections?.[0]?.resultsTime || '18:00'} onwards
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{t('currentTime')}</p>
                    <p className="font-semibold text-gray-900">
                      {currentTime.toLocaleTimeString('en-IN', { 
                        hour12: true,
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <Badge 
                    variant={votingStatus.isVotingTime ? "default" : "secondary"}
                    className={votingStatus.isVotingTime ? "bg-green-600" : ""}
                  >
                    {votingStatus.isVotingTime ? t('votingActive') : t('votingClosedStatus')}
                  </Badge>
                </div>
              </div>
              <div className="mt-4 p-4 bg-white rounded-lg border border-blue-100">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <p className="text-sm text-gray-700">{votingStatus.message}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Voting Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card 
            className="shadow-xl border-0 cursor-pointer hover:shadow-2xl transition-shadow duration-300"
            onClick={() => handleSectionSelect("register")}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">{t('voterRegistrationTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                {t('voterRegistrationDesc')}
              </p>
              <Button className="w-full btn-primary">
                {t('registerToVote')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card 
            className={`shadow-xl border-0 transition-all duration-300 ${
              votingStatus.isVotingTime 
                ? "cursor-pointer hover:shadow-2xl" 
                : "opacity-60 cursor-not-allowed"
            }`}
            onClick={() => handleSectionSelect("vote")}
          >
            <CardHeader className="text-center pb-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                votingStatus.isVotingTime 
                  ? "bg-green-100" 
                  : "bg-gray-100"
              }`}>
                <Vote className={`w-8 h-8 ${
                  votingStatus.isVotingTime 
                    ? "text-green-600" 
                    : "text-gray-400"
                }`} />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">{t('castVoteTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                {t('castVoteDesc')}
              </p>
              <Button 
                className={`w-full ${
                  votingStatus.isVotingTime 
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                disabled={!votingStatus.isVotingTime}
              >
                {votingStatus.isVotingTime ? t('voteNow') : t('votingClosed')}
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
                  <h4 className="font-semibold text-blue-900 mb-2">{t('secureVotingProcess')}</h4>
                  <p className="text-sm text-blue-800">
                    {t('votingSystemDescription')}
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
                  <h4 className="font-semibold text-green-900 mb-2">{t('aadharIntegration')}</h4>
                  <p className="text-sm text-green-800">
                    {t('aadharIntegrationDesc')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Election Status */}
        <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">{t('currentElectionTitle')}</h3>
            <p className="text-lg opacity-90 mb-6">
              {t('currentElectionDescription')}
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-green-600"
                onClick={() => handleSectionSelect("vote")}
              >
                {t('voteNow')}
              </Button>
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-blue-600"
                onClick={() => handleSectionSelect("results")}
              >
                {t('viewLiveResults')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}