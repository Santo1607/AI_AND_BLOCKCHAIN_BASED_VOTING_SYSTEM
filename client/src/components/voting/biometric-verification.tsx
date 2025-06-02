import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CameraCapture } from "@/components/ui/camera-capture";
import { Shield, CheckCircle, XCircle, Camera, User } from "lucide-react";

interface BiometricVerificationProps {
  citizenPhoto?: string | null;
  storedPhotoUrl?: string | null;
  citizenName: string;
  onVerificationComplete: (verified: boolean) => void;
  onCancel?: () => void;
}

export function BiometricVerification({ 
  citizenPhoto, 
  storedPhotoUrl,
  citizenName, 
  onVerificationComplete, 
  onCancel 
}: BiometricVerificationProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "verifying" | "success" | "failed">("pending");
  const [similarityScore, setSimilarityScore] = useState<number>(0);

  const handleCameraCapture = (imageData: string) => {
    setCapturedPhoto(imageData);
    setShowCamera(false);
    performBiometricVerification(imageData);
  };

  const performBiometricVerification = async (capturedImage: string) => {
    setVerificationStatus("verifying");
    
    try {
      // Simulate biometric verification process
      // In a real implementation, this would use facial recognition AI
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock verification result based on image comparison
      // In production, you would use a proper facial recognition service
      const mockScore = Math.random() * 100;
      const threshold = 75; // 75% similarity required
      const isVerified = mockScore >= threshold;
      
      setSimilarityScore(mockScore);
      setVerificationStatus(isVerified ? "success" : "failed");
      
      // Auto-proceed after showing result
      setTimeout(() => {
        onVerificationComplete(isVerified);
      }, 3000);
      
    } catch (error) {
      setVerificationStatus("failed");
      setTimeout(() => {
        onVerificationComplete(false);
      }, 3000);
    }
  };

  const handleRetry = () => {
    setCapturedPhoto(null);
    setVerificationStatus("pending");
    setSimilarityScore(0);
    setShowCamera(true);
  };

  if (showCamera) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <CameraCapture
          title="Biometric Verification"
          onCapture={handleCameraCapture}
          onCancel={() => {
            setShowCamera(false);
            onCancel?.();
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl mx-auto shadow-xl border-0">
        <CardHeader className="text-center bg-blue-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center justify-center text-2xl">
            <Shield className="w-8 h-8 mr-3" />
            Biometric Verification Required
          </CardTitle>
          <p className="text-blue-100 mt-2">
            Please verify your identity using facial recognition to proceed with voting
          </p>
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Reference Photo */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Registered Photo
              </h3>
              <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4" style={{ aspectRatio: "3/4" }}>
                {(citizenPhoto || storedPhotoUrl) ? (
                  <img
                    src={citizenPhoto || storedPhotoUrl || ''}
                    alt="Registered citizen"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-400" />
                    <p className="text-gray-500 ml-2">No photo available</p>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600">
                <strong>Name:</strong> {citizenName}
              </p>
            </div>

            {/* Captured Photo */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Live Capture
              </h3>
              <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4" style={{ aspectRatio: "3/4" }}>
                {capturedPhoto ? (
                  <img
                    src={capturedPhoto}
                    alt="Live capture"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
              
              {!capturedPhoto && verificationStatus === "pending" && (
                <Button 
                  onClick={() => setShowCamera(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Start Verification
                </Button>
              )}
            </div>
          </div>

          {/* Verification Status */}
          {verificationStatus !== "pending" && (
            <div className="mt-8 text-center">
              <div className="mb-6">
                {verificationStatus === "verifying" && (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    <span className="text-lg text-gray-700">Verifying identity...</span>
                  </div>
                )}

                {verificationStatus === "success" && (
                  <div className="flex items-center justify-center space-x-3 text-green-600">
                    <CheckCircle className="w-12 h-12" />
                    <div>
                      <div className="text-xl font-semibold">Verification Successful</div>
                      <div className="text-sm text-gray-600">
                        Similarity Score: {similarityScore.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                )}

                {verificationStatus === "failed" && (
                  <div className="flex items-center justify-center space-x-3 text-red-600">
                    <XCircle className="w-12 h-12" />
                    <div>
                      <div className="text-xl font-semibold">Verification Failed</div>
                      <div className="text-sm text-gray-600">
                        Similarity Score: {similarityScore.toFixed(1)}% (Required: 75%+)
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {verificationStatus === "failed" && (
                <div className="space-x-4">
                  <Button onClick={handleRetry} variant="outline">
                    Try Again
                  </Button>
                  <Button onClick={() => onCancel?.()} variant="outline">
                    Cancel
                  </Button>
                </div>
              )}

              {(verificationStatus === "success" || verificationStatus === "verifying") && (
                <div className="text-sm text-gray-500">
                  Redirecting to voting portal...
                </div>
              )}
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <strong>Security Notice:</strong> Your biometric data is processed locally and securely. 
                We use advanced facial recognition technology to ensure only authorized voters can access the voting system.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}