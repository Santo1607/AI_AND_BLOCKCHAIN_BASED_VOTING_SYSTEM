import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, RotateCcw, Check, X } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel?: () => void;
  title?: string;
  className?: string;
}

export function CameraCapture({ onCapture, onCancel, title = "Capture Photo", className = "" }: CameraCaptureProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      console.log("Starting camera...");
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        }
      });
      
      console.log("Camera stream obtained:", stream);
      streamRef.current = stream;
      
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        
        // Force video to play and update state
        video.onloadedmetadata = () => {
          console.log("Video metadata loaded");
          video.play()
            .then(() => {
              console.log("Video started playing");
              setIsStreaming(true);
            })
            .catch((error) => {
              console.error("Error playing video:", error);
              setError("Failed to start video playback");
            });
        };
        
        video.onerror = (error) => {
          console.error("Video error:", error);
          setError("Video playback error");
        };
        
        // Force video display immediately
        setTimeout(() => {
          console.log("Force updating video display");
          video.load();
          video.play();
          setIsStreaming(true);
        }, 500);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Unable to access camera. Please ensure you have granted camera permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      console.error("Video or canvas ref not available");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) {
      console.error("Cannot get canvas context");
      return;
    }

    // Ensure video is playing and has dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error("Video not ready for capture");
      setError("Video not ready. Please wait for camera to fully initialize.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Mirror the image horizontally to match the video display
    context.save();
    context.scale(-1, 1);
    context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    context.restore();

    const imageData = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(imageData);
    stopCamera();
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const confirmCapture = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
      setCapturedImage(null);
    }
  }, [capturedImage, onCapture]);

  const handleCancel = useCallback(() => {
    stopCamera();
    setCapturedImage(null);
    if (onCancel) onCancel();
  }, [stopCamera, onCancel]);

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600">
            Position yourself in the center of the frame and ensure good lighting
          </p>
        </div>

        <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-6" style={{ aspectRatio: "4/3", minHeight: "300px" }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover ${streamRef.current ? 'block' : 'hidden'}`}
            style={{ transform: 'scaleX(-1)' }}
          />
          
          {capturedImage && (
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover absolute inset-0"
              style={{ transform: 'scaleX(-1)' }}
            />
          )}

          {!streamRef.current && !capturedImage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Camera not started</p>
              </div>
            </div>
          )}

          {/* Face guide overlay */}
          {isStreaming && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-60 border-2 border-blue-400 rounded-full bg-blue-400 bg-opacity-10">
                <div className="w-full h-full rounded-full border-2 border-dashed border-blue-300"></div>
              </div>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="flex justify-center space-x-4">
          {!isStreaming && !capturedImage && (
            <>
              <Button onClick={startCamera} className="bg-blue-600 hover:bg-blue-700">
                <Camera className="w-4 h-4 mr-2" />
                Start Camera
              </Button>
              {onCancel && (
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}
            </>
          )}

          {isStreaming && (
            <>
              <Button onClick={capturePhoto} className="bg-green-600 hover:bg-green-700">
                <Camera className="w-4 h-4 mr-2" />
                Capture Photo
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </>
          )}

          {capturedImage && (
            <>
              <Button onClick={confirmCapture} className="bg-green-600 hover:bg-green-700">
                <Check className="w-4 h-4 mr-2" />
                Confirm
              </Button>
              <Button variant="outline" onClick={retakePhoto}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake
              </Button>
              {onCancel && (
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}