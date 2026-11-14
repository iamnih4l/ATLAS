export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  size?: string;
  createdTime?: string;
}

export function isGoogleDriveConfigured(): boolean {
  return (
    typeof process !== 'undefined' &&
    !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID &&
    !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID.includes('your_google')
  );
}

// Sample Google Drive photo dataset for demonstration when credentials not provided
export const SAMPLE_DRIVE_PHOTOS: GoogleDriveFile[] = [
  {
    id: 'drive-photo-1',
    name: 'IMG_4821_Northern_Lights_Tromso.jpg',
    mimeType: 'image/jpeg',
    thumbnailLink: 'https://images.unsplash.com/photo-1579033461380-adb47c3eb938?auto=format&fit=crop&w=600&q=80',
    size: '4.2 MB',
    createdTime: '2025-01-08T22:30:00Z',
  },
  {
    id: 'drive-photo-2',
    name: 'DSC_0192_Kyoto_Bamboo_Grove.jpg',
    mimeType: 'image/jpeg',
    thumbnailLink: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
    size: '6.8 MB',
    createdTime: '2024-11-05T08:15:00Z',
  },
  {
    id: 'drive-photo-3',
    name: 'GOPR9812_Skydive_Palm_Freefall.jpg',
    mimeType: 'image/jpeg',
    thumbnailLink: 'https://images.unsplash.com/photo-1521673845961-d646f903c743?auto=format&fit=crop&w=600&q=80',
    size: '8.1 MB',
    createdTime: '2025-01-15T09:12:00Z',
  },
  {
    id: 'drive-photo-4',
    name: 'PANO_Swiss_Alps_Matterhorn.jpg',
    mimeType: 'image/jpeg',
    thumbnailLink: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
    size: '12.4 MB',
    createdTime: '2024-07-22T14:45:00Z',
  },
];

