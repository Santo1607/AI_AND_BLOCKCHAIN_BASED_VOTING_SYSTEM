import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VerificationForm } from "@/components/public/verification-form";
import { VerificationResult } from "@/components/public/verification-result";
import { AgeVerification } from "@/components/age-verification";
import { LanguageSelectorButton } from "@/components/language-selector";
import { SecurityChallenge } from "@/components/recaptcha";
import { useLanguage } from "@/hooks/use-language";
import { Shield, Search, Clock, Headphones, ArrowRight, Globe } from "lucide-react";
import type { Citizen } from "@shared/schema";

export default function PublicPortal() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [verificationResult, setVerificationResult] = useState<Citizen | null>(null);
  const [ageVerified, setAgeVerified] = useState<boolean>(false);
  const [securityVerified, setSecurityVerified] = useState<boolean>(false);
  const [showAgeVerification, setShowAgeVerification] = useState<boolean>(true);

  const handleVerificationSuccess = (citizen: Citizen) => {
    setVerificationResult(citizen);
  };

  const handleNewSearch = () => {
    setVerificationResult(null);
  };

  const handleAgeVerification = (isEligible: boolean, age: number) => {
    if (isEligible) {
      setAgeVerified(true);
      setShowAgeVerification(false);
    } else {
      setTimeout(() => {
        setShowAgeVerification(true);
        setAgeVerified(false);
      }, 3000);
    }
  };

  const handleSecurityVerification = (isVerified: boolean) => {
    setSecurityVerified(isVerified);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Aadhar Management System</h1>
                <p className="text-sm text-gray-500">Government of India</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <LanguageSelectorButton />
              <Button 
                variant="outline"
                onClick={() => setLocation("/voting")}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                {t('votingPortal')}
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

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('publicPortal')} {t('aadharVerification')}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('verifyAadhar')} - {t('ageRequirement')}
          </p>
        </div>

        {/* Age Verification Step */}
        {showAgeVerification && !ageVerified && (
          <div className="flex justify-center mb-8">
            <AgeVerification 
              onVerified={handleAgeVerification}
              title={t('ageVerificationRequired')}
            />
          </div>
        )}

        {/* Security Challenge Step */}
        {ageVerified && !securityVerified && (
          <div className="flex justify-center mb-8">
            <SecurityChallenge 
              onVerified={handleSecurityVerification}
              size="normal"
            />
          </div>
        )}

        {/* Verification Form */}
        {ageVerified && securityVerified && !verificationResult && (
          <Card className="shadow-xl border-0 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-900 text-center">
                {t('verifyAadhar')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VerificationForm onSuccess={handleVerificationSuccess} />
            </CardContent>
          </Card>
        )}

        {/* Verification Result */}
        {verificationResult && (
          <VerificationResult 
            citizen={verificationResult} 
            onNewSearch={handleNewSearch}
          />
        )}

        {/* Service Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card className="card-shadow text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Secure & Private</h4>
              <p className="text-sm text-gray-600">
                Your data is protected with government-grade security protocols and encryption
              </p>
            </CardContent>
          </Card>

          <Card className="card-shadow text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">24/7 Available</h4>
              <p className="text-sm text-gray-600">
                Access verification services anytime, anywhere with instant results
              </p>
            </CardContent>
          </Card>

          <Card className="card-shadow text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Support Available</h4>
              <p className="text-sm text-gray-600">
                Get help when you need it from our dedicated government support team
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Important Notice */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Important Information</h4>
                <p className="text-sm text-blue-800">
                  This verification portal is for informational purposes only. For official government 
                  documents, certificates, or any legal proceedings, please visit your nearest Aadhar 
                  enrollment center with original documents. This system provides real-time access to 
                  our centralized database for verification purposes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
