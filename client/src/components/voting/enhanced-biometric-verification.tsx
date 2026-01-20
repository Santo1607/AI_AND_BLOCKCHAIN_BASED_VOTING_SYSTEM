import { useState, useEffect, useCallback, useRef } from 'react';
import { BiometricService } from '@/lib/biometric-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CameraCapture } from '@/components/ui/camera-capture';
import { Fingerprint, Camera, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import * as faceapi from 'face-api.js';

interface BiometricVerificationProps {
  storedPhotoUrl?: string; // Should be the URL to the Aadhar photo
  storedFingerprintData?: string;
  onVerificationComplete: (success: boolean, results: {
    faceMatch: boolean;
    fingerprintMatch: boolean;
    confidence: number;
  }) => void;
  onCancel: () => void;
}

export function EnhancedBiometricVerification({
  storedPhotoUrl,
  storedFingerprintData,
  onVerificationComplete,
  onCancel
}: BiometricVerificationProps) {
  const [currentStep, setCurrentStep] = useState<'loading' | 'face' | 'fingerprint' | 'complete'>('loading');
  const [faceVerified, setFaceVerified] = useState(false);
  const [fingerprintVerified, setFingerprintVerified] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationResults, setVerificationResults] = useState({
    faceMatch: false,
    fingerprintMatch: false,
    confidence: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL) // Fallback / Robust detector
        ]);
        setModelsLoaded(true);
        setCurrentStep('face');
      } catch (err) {
        console.error("Failed to load face-api models:", err);
        setError("Failed to load facial recognition models. Please refresh and try again.");
      }
    };
    loadModels();
  }, []);

  const handleFaceCapture = useCallback(async (imageData: string) => {
    if (!modelsLoaded) return;
    setIsProcessing(true);
    setError(null);

    try {
      // 1. Detect face in the captured image
      const captureImg = await faceapi.fetchImage(imageData);
      const detection = await faceapi.detectSingleFace(captureImg, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (!detection) {
        throw new Error("No face detected. Please ensure your face is clearly visible and look at the camera.");
      }

      // 2. Load stored Aadhar photo reference
      if (!storedPhotoUrl) {
        throw new Error("No reference photo available for verification.");
      }

      // 3. Compare Faces
      const storedImg = await faceapi.fetchImage(storedPhotoUrl);
      const storedDetection = await faceapi.detectSingleFace(storedImg, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (!storedDetection) {
        // Fallback to SSD Mobilenet if tiny detector fails on ID photo (often ID photos are clearer but crop might be tricky)
        const storedDetectionRobust = await faceapi.detectSingleFace(storedImg, new faceapi.SsdMobilenetv1Options())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!storedDetectionRobust) {
          throw new Error("Could not verify the reference photo from database.");
        }
      }

      const referenceDescriptor = storedDetection ? storedDetection.descriptor : (await faceapi.detectSingleFace(storedImg).withFaceLandmarks().withFaceDescriptor())?.descriptor;

      if (!referenceDescriptor) throw new Error("Could not process reference facial data.");

      const distance = faceapi.euclideanDistance(detection.descriptor, referenceDescriptor);

      // Distance < 0.6 is generally a match. We use a stricter threshold for voting.
      const matchThreshold = 0.5;
      const isMatch = distance < matchThreshold;

      // Calculate confidence (inverse of distance)
      const confidence = Math.max(0, 100 * (1 - distance));

      if (isMatch) {
        setFaceVerified(true);
        setVerificationResults(prev => ({ ...prev, faceMatch: true, confidence }));
        setCurrentStep('fingerprint');
      } else {
        setError("Face does not match our records. Please try again.");
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Facial verification error.");
    } finally {
      setIsProcessing(false);
    }
  }, [modelsLoaded, storedPhotoUrl]);


  const handleFingerprintScan = useCallback(async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const isAvailable = await BiometricService.isAvailable();

      if (!isAvailable) {
        setError("Biometric hardware not detected. Please ensure Windows Hello is set up.");
        setIsProcessing(false);
        return;
      }

      const success = await BiometricService.verifyUser();

      if (success) {
        setFingerprintVerified(true);
        setVerificationResults(prev => ({ ...prev, fingerprintMatch: true }));
        setCurrentStep('complete');

        setTimeout(() => {
          onVerificationComplete(true, {
            faceMatch: faceVerified,
            fingerprintMatch: true,
            confidence: verificationResults.confidence
          });
        }, 1000);
      } else {
        setError('Fingerprint verification failed. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      if (err.name === 'NotAllowedError') {
        setError('Scanning cancelled. Please try again.');
      } else {
        setError(`Biometric Error: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [faceVerified, verificationResults.confidence, onVerificationComplete]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Bio-Secure Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center gap-8 mb-6">
            {/* Progress Steps UI - Same as before */}
            <div className="flex flex-col items-center gap-2">
              <div className={`p-3 rounded-full ${faceVerified ? 'bg-green-100 text-green-600' : 'bg-gray-100'}`}>
                <Camera className="h-6 w-6" />
              </div>
              <Badge variant={faceVerified ? 'default' : 'outline'}>
                {faceVerified ? <Check className="h-3 w-3 mr-1" /> : null}
                Face Scan
              </Badge>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className={`p-3 rounded-full ${fingerprintVerified ? 'bg-green-100 text-green-600' : 'bg-gray-100'}`}>
                <Fingerprint className="h-6 w-6" />
              </div>
              <Badge variant={fingerprintVerified ? 'default' : 'outline'}>
                {fingerprintVerified ? <Check className="h-3 w-3 mr-1" /> : null}
                Fingerprint
              </Badge>
            </div>
          </div>

          {error && (
            <Alert className="mb-4 bg-red-50 text-red-900 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {currentStep === 'loading' && (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4" />
              <p className="text-gray-600">Loading Secure AI Models...</p>
            </div>
          )}

          {currentStep === 'face' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">Step 1: Facial Verification</h3>
              <p className="text-center text-gray-600">
                Look directly at the camera. Verification is performed against your Aadhar photo.
              </p>

              <CameraCapture
                onCapture={handleFaceCapture}
                onCancel={onCancel}
                title="Face Verification"
                className="mx-auto"
              />

              {isProcessing && (
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2">Verifying biometric data...</p>
                </div>
              )}
            </div>
          )}

          {currentStep === 'fingerprint' && (
            <div className="space-y-4">
              {/* Fingerprint step UI - Same as before */}
              <h3 className="text-lg font-semibold text-center">Step 2: Fingerprint Verification</h3>
              <p className="text-center text-gray-600">
                Place your finger on the scanner.
              </p>
              <div className="flex flex-col items-center gap-4">
                <Button
                  onClick={handleFingerprintScan}
                  disabled={isProcessing}
                  className="w-48 bg-blue-600 hover:bg-blue-700"
                >
                  {isProcessing ? 'Scanning...' : 'Scan Fingerprint'}
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'complete' && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-600">Identity Confirmed</h3>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
