import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { calculateAge, isEligibleAge } from "@shared/languages";

interface AgeVerificationProps {
  onVerified: (isEligible: boolean, age: number) => void;
  requiredAge?: number;
  title?: string;
}

export function AgeVerification({ onVerified, requiredAge = 18, title }: AgeVerificationProps) {
  const { t } = useLanguage();
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isEligible: boolean;
    age: number;
    message: string;
  } | null>(null);

  const handleVerification = async () => {
    if (!dateOfBirth) return;

    setIsVerifying(true);
    
    try {
      // Check if this date of birth exists in the Aadhar database
      const response = await fetch('/api/check-dob', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dateOfBirth }),
      });
      
      const dobCheckResult = await response.json();
      
      if (!dobCheckResult.exists) {
        const result = {
          isEligible: false,
          age: 0,
          message: "Date of birth not found in our records. Please contact admin to register first."
        };
        
        setVerificationResult(result);
        setIsVerifying(false);
        onVerified(false, 0);
        return;
      }
      
      // If DOB exists, calculate age and check 18+ requirement
      const age = calculateAge(dateOfBirth);
      const isEligible = age >= requiredAge;
      
      const result = {
        isEligible,
        age,
        message: isEligible 
          ? t('ageVerified') + ` (${age} ${age === 1 ? 'year' : 'years'} old)`
          : t('underAge') + ` (${age} ${age === 1 ? 'year' : 'years'} old)`
      };
      
      setVerificationResult(result);
      setIsVerifying(false);
      onVerified(isEligible, age);
    } catch (error) {
      const result = {
        isEligible: false,
        age: 0,
        message: "Error verifying date of birth. Please try again."
      };
      
      setVerificationResult(result);
      setIsVerifying(false);
      onVerified(false, 0);
    }
  };

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 10); // Minimum 10 years old to enter date

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          {title || t('ageVerificationRequired')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center text-sm text-gray-600 mb-4">
          {t('mustBe18')}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dob">{t('dateOfBirth')}</Label>
          <Input
            id="dob"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            min="1900-01-01"
            className="w-full"
          />
        </div>

        <Button 
          onClick={handleVerification}
          disabled={!dateOfBirth || isVerifying}
          className="w-full"
        >
          {isVerifying ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {t('loading')}
            </div>
          ) : (
            t('verify')
          )}
        </Button>

        {verificationResult && (
          <Alert className={verificationResult.isEligible ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <div className="flex items-center gap-2">
              {verificationResult.isEligible ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
              <AlertDescription className={verificationResult.isEligible ? "text-green-700" : "text-red-700"}>
                {verificationResult.message}
              </AlertDescription>
            </div>
          </Alert>
        )}

        <div className="text-xs text-gray-500 text-center mt-4">
          <p>{t('ageRequirement')}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function InlineAgeVerification({ dateOfBirth, onAgeChange }: { 
  dateOfBirth: string; 
  onAgeChange: (age: number, isEligible: boolean) => void;
}) {
  const { t } = useLanguage();
  const age = dateOfBirth ? calculateAge(dateOfBirth) : 0;
  const isEligible = dateOfBirth ? isEligibleAge(dateOfBirth) : false;

  // Call onAgeChange whenever dateOfBirth changes
  React.useEffect(() => {
    if (dateOfBirth) {
      onAgeChange(age, isEligible);
    }
  }, [dateOfBirth, age, isEligible, onAgeChange]);

  if (!dateOfBirth) return null;

  return (
    <div className={`mt-2 p-2 rounded-md ${isEligible ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
      <div className="flex items-center gap-2 text-sm">
        {isEligible ? (
          <CheckCircle className="w-4 h-4" />
        ) : (
          <AlertTriangle className="w-4 h-4" />
        )}
        <span>
          {isEligible 
            ? `${t('ageVerified')} (${age} years old)`
            : `${t('underAge')} (${age} years old)`
          }
        </span>
      </div>
    </div>
  );
}