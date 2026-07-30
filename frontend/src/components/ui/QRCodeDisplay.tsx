import React, { useEffect, useState } from 'react';
import QRCodeLib from 'qrcode';

interface QRCodeDisplayProps {
  qrCode?: string;
  registrationId?: string;
  size?: number;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  registrationId,
  size = 200,
}) => {
  const [qrImageUrl, setQrImageUrl] = useState<string>('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!registrationId) return;

    QRCodeLib.toDataURL(registrationId, {
      width: size,
      margin: 2,
      errorCorrectionLevel: 'M',
    })
      .then(setQrImageUrl)
      .catch(() => setError(true));
  }, [registrationId, size]);

  if (!registrationId) {
    return <p className="text-gray-500 text-sm">No registration ID available</p>;
  }

  if (error || !qrImageUrl) {
    return (
      <div className="text-center">
        <p className="text-gray-500 text-sm mb-2">QR preview unavailable</p>
        <p className="font-mono font-semibold text-gray-900">{registrationId}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="p-4 bg-white border-2 border-gray-300 rounded-lg shadow-sm">
        <img
          src={qrImageUrl}
          alt="Registration QR Code"
          width={size}
          height={size}
          className="block"
        />
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-600">Registration ID</p>
        <p className="font-mono font-semibold text-gray-900">{registrationId}</p>
        <p className="text-xs text-gray-500 mt-1">Staff can scan this code to check you in</p>
      </div>
    </div>
  );
};
