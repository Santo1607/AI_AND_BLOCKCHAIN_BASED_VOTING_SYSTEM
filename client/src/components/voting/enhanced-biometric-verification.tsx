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
  const storedFaceDescriptorRef = useRef<Float32Array | null>(null);

  // Load models on mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        // Use public CDN for models to ensure all shards are available and correct
        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
        console.log("Loading FaceAPI models from CDN...");
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        console.log("FaceAPI models loaded");
        setModelsLoaded(true);

        // Pre-fetch/process the stored photo if available
        if (storedPhotoUrl) {
          processStoredPhoto(storedPhotoUrl);
        } else {
          // If no photo to compare against, we can't really verify face. 
          // For now, we might error out or just allow proceed if this is a lenient flow (but it says verification required).
          setError("No stored photo found for this citizen. Cannot perform face verification.");
        }

      } catch (err: any) {
        console.error("Failed to load models:", err);
        setError(`Failed to load biometric models: ${err.message || err}`);
      }
    };
    loadModels();
  }, [storedPhotoUrl]);

  // Process the stored photo to get its descriptor
  const processStoredPhoto = async (url: string) => {
    try {
      console.log("Processing stored photo...", url);
      // Fetch image and create HTMLImageElement
      const img = await faceapi.fetchImage(url);

      // Detect single face
      const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (detection) {
        console.log("Face detected in stored photo");
        storedFaceDescriptorRef.current = detection.descriptor;
        setCurrentStep('face');
      } else {
        console.warn("No face detected in stored photo");
        setError("Could not detect a face in your registered database photo. Please contact support.");
      }
    } catch (err) {
      console.error("Error processing stored photo:", err);
      // Fallback: If CORS or other issue prevents easy loading, we might need a proxy or base64. 
      // Assuming for this prototype that the URL is accessible (e.g. from same domain /uploads)
      setError("Failed to access stored photo for verification.");
    }
  };

  const handleFaceCapture = useCallback(async (imageData: string) => {
    if (!modelsLoaded || !storedFaceDescriptorRef.current) {
      setError("System not ready or reference photo missing.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create an image element from the base64 capture
      const img = await faceapi.fetchImage(imageData);

      // Detect face in captured image
      const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (!detection) {
        setError("No face detected in camera feed. Please try again.");
        setIsProcessing(false);
        return;
      }

      // Compare descriptors
      const distance = faceapi.euclideanDistance(storedFaceDescriptorRef.current, detection.descriptor);
      console.log("Face Match Distance:", distance);

      // Threshold: Lower is better. 0.6 is standard for 128D, strictly maybe 0.5
      // For TinyFace, sometimes loose thresholds are needed, ensuring 0.6 is safe.
      const threshold = 0.6;

      if (distance < threshold) {
        // MATCH
        const confidence = Math.max(0, (1 - distance) * 100);
        console.log(`Match found! Confidence: ${confidence.toFixed(2)}%`);

        setFaceVerified(true);
        setVerificationResults(prev => ({ ...prev, faceMatch: true, confidence }));
        setCurrentStep('fingerprint');
      } else {
        // NO MATCH
        setError("Face does not match our records. Please try again.");
      }

    } catch (err) {
      console.error("Verification error:", err);
      setError("An error occurred during verification processing.");
    } finally {
      setIsProcessing(false);
    }
  }, [modelsLoaded]);


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
            Biometric Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center gap-8 mb-6">
            {/* Progress Steps UI */}
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
              <p className="text-gray-600">Initializing Biometric Models...</p>
              <p className="text-xs text-gray-400 mt-2">This may take a moment</p>
            </div>
          )}

          {currentStep === 'face' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">Step 1: Facial Verification</h3>
              <p className="text-center text-gray-600">
                Look directly at the camera.
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
