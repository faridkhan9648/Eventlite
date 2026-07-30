import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Container } from './';
import { staffAPI } from '../../services/api';

type ScanStatus = 'idle' | 'scanning' | 'success' | 'warning' | 'error';

const SCANNER_ELEMENT_ID = 'qr-scanner-viewport';

async function getPreferredCameraId(): Promise<string | { facingMode: string }> {
  try {
    const cameras = await Html5Qrcode.getCameras();
    if (!cameras.length) {
      return { facingMode: 'user' };
    }

    const backCamera = cameras.find((camera) =>
      /back|rear|environment/i.test(camera.label)
    );
    return backCamera?.id ?? cameras[0].id;
  } catch {
    return { facingMode: 'user' };
  }
}

export const QRScanner: React.FC = () => {
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [manualId, setManualId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [lastDetected, setLastDetected] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isProcessingRef = useRef(false);
  const lastScannedRef = useRef<string>('');

  const resetMessage = useCallback(() => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }
    resetTimeoutRef.current = setTimeout(() => {
      setMessage(null);
      setStatus('idle');
      setLastDetected(null);
      lastScannedRef.current = '';
    }, 5000);
  }, []);

  const resumeScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner || scanner.getState() !== Html5QrcodeScannerState.PAUSED) return;

    try {
      await scanner.resume();
    } catch {
      // Scanner may have been stopped
    }
  }, []);

  const processQRCode = useCallback(async (qrData: string) => {
    const trimmed = qrData.trim();
    if (!trimmed || isProcessingRef.current) return;

    if (lastScannedRef.current === trimmed) return;
    lastScannedRef.current = trimmed;

    const scanner = scannerRef.current;
    if (scanner?.getState() === Html5QrcodeScannerState.SCANNING) {
      try {
        await scanner.pause(true);
      } catch {
        // Continue even if pause fails
      }
    }

    isProcessingRef.current = true;
    setIsProcessing(true);
    setStatus('scanning');
    setLastDetected(trimmed);
    setMessage('Processing check-in...');

    try {
      const data = await staffAPI.scanQR(trimmed);

      setStatus('success');
      setMessage(`✅ ${data.attendeeName} checked in for ${data.eventTitle}`);
      resetMessage();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Check-in failed';

      if (errorMessage.toLowerCase().includes('already checked in')) {
        setStatus('warning');
        setMessage(`⚠️ ${errorMessage}`);
      } else {
        setStatus('error');
        setMessage(`❌ ${errorMessage}`);
      }
      resetMessage();
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
      await resumeScanner();
    }
  }, [resetMessage, resumeScanner]);

  const processQRCodeRef = useRef(processQRCode);
  processQRCodeRef.current = processQRCode;

  const stopCamera = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) {
      setCameraActive(false);
      return;
    }

    scannerRef.current = null;

    try {
      const state = scanner.getState();
      if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
        await scanner.stop();
      }
      scanner.clear();
    } catch {
      // Scanner may already be stopped
    }

    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    if (scannerRef.current) return;

    setMessage(null);
    setStatus('idle');
    setLastDetected(null);
    lastScannedRef.current = '';

    try {
      const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID, { verbose: false });
      scannerRef.current = scanner;
      const cameraId = await getPreferredCameraId();

      await scanner.start(
        cameraId,
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const size = Math.floor(minEdge * 0.75);
            return { width: size, height: size };
          },
          disableFlip: false,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true,
          },
        },
        (decodedText) => {
          setLastDetected(decodedText);
          void processQRCodeRef.current(decodedText);
        },
        () => {
          // No QR in frame yet
        }
      );

      setCameraActive(true);
      setMessage('Point the camera at the attendee QR code');
      setStatus('idle');
    } catch (error) {
      console.error('Camera access error:', error);
      scannerRef.current = null;
      setCameraActive(false);
      setStatus('error');
      setMessage('❌ Failed to access camera. Try uploading a QR image or use manual entry.');
      resetMessage();
    }
  }, [resetMessage]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';

    try {
      let decodedText: string;

      if (scannerRef.current?.getState() === Html5QrcodeScannerState.SCANNING) {
        decodedText = await scannerRef.current.scanFile(file, false);
      } else {
        const tempScanner = new Html5Qrcode('qr-file-scanner-temp');
        decodedText = await tempScanner.scanFile(file, false);
        tempScanner.clear();
      }

      await processQRCode(decodedText);
    } catch (error) {
      console.error('File scan error:', error);
      setStatus('error');
      setMessage('❌ Could not read QR code from image. Try better lighting or manual entry.');
      resetMessage();
    }
  };

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }

      const scanner = scannerRef.current;
      if (!scanner) return;

      scannerRef.current = null;
      void (async () => {
        try {
          const state = scanner.getState();
          if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
            await scanner.stop();
          }
          scanner.clear();
        } catch {
          // Ignore cleanup errors
        }
      })();
    };
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualId.trim()) {
      void processQRCode(manualId.trim());
      setManualId('');
    }
  };

  const statusClasses = {
    idle: 'bg-gray-50 border-gray-200 text-gray-800',
    scanning: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-4 px-4">
      <div id="qr-file-scanner-temp" className="hidden" />
      <Container size="md">
        <Card className="w-full shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
              <span className="text-white font-bold text-2xl">📱</span>
            </div>
            <CardTitle className="text-3xl text-gray-900 mb-2">QR Scanner</CardTitle>
            <CardDescription className="text-base text-gray-600">
              Scan attendee QR codes to check them in
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-6">
              <div className="relative w-full min-h-[320px] rounded-lg overflow-hidden bg-black">
                <div id={SCANNER_ELEMENT_ID} className="w-full min-h-[320px]" />

                {!cameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-white text-center px-4">
                      Start the camera to scan QR codes
                    </p>
                  </div>
                )}

                {cameraActive && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm animate-pulse pointer-events-none">
                    Live scanning
                  </div>
                )}
              </div>

              {lastDetected && cameraActive && status === 'idle' && (
                <p className="text-sm text-gray-600 text-center">
                  Last detected: <span className="font-mono">{lastDetected.slice(0, 40)}{lastDetected.length > 40 ? '…' : ''}</span>
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {!cameraActive ? (
                  <button
                    type="button"
                    onClick={() => void startCamera()}
                    disabled={isProcessing}
                    className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                  >
                    Start Camera
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void stopCamera()}
                    className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 font-medium"
                  >
                    Stop Camera
                  </button>
                )}

                <label className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 font-medium text-center cursor-pointer">
                  Upload QR Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => void handleFileUpload(e)}
                  />
                </label>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Manual check-in (registration ID)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                    placeholder="REG-1234567890-abc123"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={isProcessing || !manualId.trim()}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                  >
                    Check In
                  </button>
                </div>
              </form>

              {message && (
                <div className={`p-4 rounded-lg border-2 text-center text-lg font-medium ${statusClasses[status]}`}>
                  {message}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};
