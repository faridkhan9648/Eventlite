import { useQuery } from '@tanstack/react-query';
import { eventCreatorAPI, publicAPI } from '../services/api';

// Public Events Hooks
export const usePublicEvents = () => {
  return useQuery({
    queryKey: ['public', 'events'],
    queryFn: eventCreatorAPI.getEvents,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useEventDetails = (eventId: string) => {
  return useQuery({
    queryKey: ['public', 'event', eventId],
    queryFn: () => publicAPI.getEventDetails(eventId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!eventId, // Only run if eventId is provided
  });
};

// QR Code Hooks
export const useRegistrationQR = (registrationId: string) => {
  return useQuery({
    queryKey: ['public', 'registration-qr', registrationId],
    queryFn: () => publicAPI.getRegistrationQR(registrationId),
    staleTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!registrationId, // Only run if registrationId is provided
  });
};

export const useDownloadQR = () => {
  // This is a direct download, not a query
  const downloadQR = async (registrationId: string) => {
    try {
      const blob = await publicAPI.downloadQR(registrationId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${registrationId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download QR code:', error);
      throw error;
    }
  };

  return { downloadQR };
};
