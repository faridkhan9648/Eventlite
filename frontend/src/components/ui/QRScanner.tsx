import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Container } from './';

export const QRScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const scanTimeoutRef = useRef<any>();

  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } as any
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsScanning(true);
      setError(null);
    } catch (error) {
      console.error('Camera access error:', error);
      setError('Failed to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const simulateScan = () => {
    // Simulate QR code detection for demo
    const mockQRCodes = [
      'REG-1234567890-VALID',
      'REG-0987654321-VALID', 
      'REG-INVALID-FORMAT',
      'REG-ALREADY-CHECKEDIN'
    ];
    
    const randomQR = mockQRCodes[Math.floor(Math.random() * mockQRCodes.length)];
    setResult(randomQR);
  };

  const processQRCode = async (qrData: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/attendance/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrCode: qrData })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setResult(`✅ ${data.attendeeName} checked in successfully!`);
      } else if (response.status === 409) {
        setResult(`⚠️ Already checked in`);
      } else {
        setResult(`❌ ${data.error || 'Check-in failed'}`);
      }
      
      // Auto reset after 3 seconds
      scanTimeoutRef.current = setTimeout(() => setResult(null), 3000);
      
    } catch (error) {
      setResult('❌ Network error. Please try again.');
      setTimeout(() => setResult(null), 3000);
    }
  };

  useEffect(() => {
    if (result) {
      processQRCode(result);
    }
  }, [result]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-4 px-4">
      <Container size="md">
        <Card className="w-full shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
              <span className="text-white font-bold text-2xl">📱</span>
            </div>
            <CardTitle className="text-3xl text-gray-900 mb-2">QR Scanner</CardTitle>
            <CardDescription className="text-base text-gray-600">
              Scan QR codes for event check-in
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-6">
              {/* Camera View */}
              <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '1' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {!isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 border-4 border-dashed border-white rounded-lg">
                      <div className="flex items-center justify-center h-full">
                        <div className="text-white text-center">
                          <div className="text-6xl mb-2">📷</div>
                          <p className="text-lg">Camera Ready</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isScanning && (
                  <div className="absolute top-4 left-4 right-4">
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm animate-pulse">
                      Scanning...
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="grid grid-cols-2 gap-4">
                {!isScanning ? (
                  <button
                    onClick={startCamera}
                    className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Start Camera
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 font-medium"
                  >
                    Stop Camera
                  </button>
                )}
                
                <button
                  onClick={simulateScan}
                  className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-medium"
                >
                  Simulate Scan (Demo)
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Result Display */}
              {result && (
                <div className={`
                  p-4 rounded-lg border-2 text-center text-lg font-medium
                  ${result.includes('✅') 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : result.includes('⚠️')
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                  }
                `}>
                  {result}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};
