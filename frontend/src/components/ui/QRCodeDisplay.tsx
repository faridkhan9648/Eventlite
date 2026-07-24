import React from 'react';

interface QRCodeDisplayProps {
  qrCode?: string;
  registrationId?: string;
  size?: number;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  qrCode, 
  registrationId, 
  size = 200 
}) => {
  // If no QR code provided, generate a simple placeholder
  const qrCodeUrl = qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${registrationId || 'REG-DEMO'}`;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="p-4 bg-white border-2 border-gray-300 rounded-lg shadow-sm">
        <img 
          src={qrCodeUrl}
          alt="Registration QR Code"
          width={size}
          height={size}
          className="block"
        />
      </div>
      {registrationId && (
        <div className="text-center">
          <p className="text-sm text-gray-600">Registration ID</p>
          <p className="font-mono font-semibold text-gray-900">{registrationId}</p>
        </div>
      )}
    </div>
  );
};
