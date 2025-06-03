import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Shield, RefreshCw } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

// Free reCAPTCHA alternative using simple challenge verification
interface SecurityChallengeProps {
  onVerified: (isVerified: boolean) => void;
  size?: 'normal' | 'compact';
}

export function SecurityChallenge({ onVerified, size = 'normal' }: SecurityChallengeProps) {
  const { t } = useLanguage();
  const [challenge, setChallenge] = useState<{
    question: string;
    answer: number;
    options: number[];
  } | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const generateChallenge = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const correctAnswer = num1 + num2;
    
    // Generate 3 wrong options
    const wrongOptions: number[] = [];
    while (wrongOptions.length < 3) {
      const wrong = correctAnswer + Math.floor(Math.random() * 10) - 5;
      if (wrong !== correctAnswer && wrong > 0 && !wrongOptions.includes(wrong)) {
        wrongOptions.push(wrong);
      }
    }
    
    const allOptions = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5);
    
    setChallenge({
      question: `${num1} + ${num2} = ?`,
      answer: correctAnswer,
      options: allOptions
    });
    setSelectedAnswer(null);
  };

  const handleVerification = () => {
    if (selectedAnswer === challenge?.answer) {
      setIsVerified(true);
      onVerified(true);
    } else {
      setAttempts(prev => prev + 1);
      if (attempts >= 2) {
        // After 3 failed attempts, generate new challenge
        generateChallenge();
        setAttempts(0);
      }
      onVerified(false);
    }
  };

  useEffect(() => {
    generateChallenge();
  }, []);

  if (isVerified) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
        <Shield className="w-5 h-5 text-green-600" />
        <span className="text-green-700 text-sm">Security verification completed</span>
      </div>
    );
  }

  return (
    <div className={`border border-gray-200 rounded-md p-4 bg-gray-50 ${size === 'compact' ? 'max-w-xs' : 'max-w-md'}`}>
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Security Verification</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={generateChallenge}
          className="ml-auto p-1 h-6 w-6"
        >
          <RefreshCw className="w-3 h-3" />
        </Button>
      </div>
      
      {challenge && (
        <div className="space-y-3">
          <div className="text-center">
            <span className="text-lg font-mono">{challenge.question}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {challenge.options.map((option) => (
              <Button
                key={option}
                variant={selectedAnswer === option ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedAnswer(option)}
                className="h-8"
              >
                {option}
              </Button>
            ))}
          </div>
          
          <Button
            onClick={handleVerification}
            disabled={selectedAnswer === null}
            size="sm"
            className="w-full"
          >
            {t('verify')}
          </Button>
          
          {attempts > 0 && (
            <div className="text-xs text-red-600 text-center">
              Incorrect answer. {3 - attempts} attempts remaining.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Enhanced Canvas-based CAPTCHA for better security
export function CanvasCaptcha({ onVerified }: { onVerified: (isVerified: boolean) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    drawCaptcha(result);
    setUserInput('');
  };

  const drawCaptcha = (text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add noise lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `hsl(${Math.random() * 360}, 50%, 80%)`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }
    
    // Draw text
    ctx.font = '24px Arial';
    ctx.fillStyle = '#333';
    for (let i = 0; i < text.length; i++) {
      const x = 20 + i * 25;
      const y = 30 + Math.random() * 10 - 5;
      const rotation = (Math.random() - 0.5) * 0.4;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }
  };

  const handleVerification = () => {
    if (userInput.toLowerCase() === captchaText.toLowerCase()) {
      setIsVerified(true);
      onVerified(true);
    } else {
      generateCaptcha();
      onVerified(false);
    }
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  if (isVerified) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
        <Shield className="w-5 h-5 text-green-600" />
        <span className="text-green-700 text-sm">CAPTCHA verified successfully</span>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-md p-4 bg-gray-50 max-w-xs">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">CAPTCHA Verification</span>
      </div>
      
      <div className="space-y-3">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={150}
            height={50}
            className="border border-gray-300 rounded"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={generateCaptcha}
            className="absolute top-0 right-0 p-1 h-6 w-6"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
        
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Enter CAPTCHA"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          maxLength={5}
        />
        
        <Button
          onClick={handleVerification}
          disabled={userInput.length !== 5}
          size="sm"
          className="w-full"
        >
          Verify
        </Button>
      </div>
    </div>
  );
}