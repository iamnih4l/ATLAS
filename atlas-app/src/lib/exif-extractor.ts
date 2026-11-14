import exifr from 'exifr';
import { reverseGeocode } from './geocoding';
import { ExtractedExifData } from '@/types';

export interface PhotoLocationSuggestion {
  latitude: number;
  longitude: number;
  name: string;
  city: string;
  country: string;
  venue: string;
  date: string | null;
  camera: string | null;
}

export async function extractExifFromPhoto(
  file: File
): Promise<{ exif: ExtractedExifData; suggestion: PhotoLocationSuggestion | null }> {
  try {
    // Parse EXIF, GPS, and TIFF tags
    const output = await exifr.parse(file, {
      gps: true,
      tiff: true,
      exif: true,
      pick: [
        'latitude',
        'longitude',
        'DateTimeOriginal',
        'CreateDate',
        'Make',
        'Model',
        'LensModel',
        'FocalLength',
        'FNumber',
        'ISO',
        'ExposureTime',
      ],
    });

    if (!output) {
      return {
        exif: {
          latitude: null,
          longitude: null,
          dateTime: null,
          camera: null,
          lens: null,
          focalLength: null,
          aperture: null,
          iso: null,
          shutterSpeed: null,
        },
        suggestion: null,
      };
    }

    const latitude = typeof output.latitude === 'number' ? output.latitude : null;
    const longitude = typeof output.longitude === 'number' ? output.longitude : null;

    let dateTimeStr: string | null = null;
    if (output.DateTimeOriginal) {
      const d = new Date(output.DateTimeOriginal);
      if (!isNaN(d.getTime())) {
        dateTimeStr = d.toISOString().split('T')[0];
      }
    } else if (output.CreateDate) {
      const d = new Date(output.CreateDate);
      if (!isNaN(d.getTime())) {
        dateTimeStr = d.toISOString().split('T')[0];
      }
    }

    const camera = output.Make && output.Model
      ? `${output.Make} ${output.Model}`.replace(/\s+/g, ' ').trim()
      : output.Model || null;

    const exifData: ExtractedExifData = {
      latitude,
      longitude,
      dateTime: dateTimeStr,
      camera,
      lens: output.LensModel || null,
      focalLength: output.FocalLength ? `${output.FocalLength}mm` : null,
      aperture: output.FNumber ? `ƒ/${output.FNumber}` : null,
      iso: output.ISO || null,
      shutterSpeed: output.ExposureTime ? `1/${Math.round(1 / output.ExposureTime)}s` : null,
    };

    let suggestion: PhotoLocationSuggestion | null = null;

    if (latitude !== null && longitude !== null) {
      const geo = await reverseGeocode(latitude, longitude);
      if (geo) {
        suggestion = {
          latitude,
          longitude,
          name: geo.name,
          city: geo.city,
          country: geo.country,
          venue: geo.venue,
          date: dateTimeStr,
          camera,
        };
      } else {
        suggestion = {
          latitude,
          longitude,
          name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          city: '',
          country: '',
          venue: '',
          date: dateTimeStr,
          camera,
        };
      }
    }

    return { exif: exifData, suggestion };
  } catch (error) {
    console.warn('Failed to parse EXIF metadata:', error);
    return {
      exif: {
        latitude: null,
        longitude: null,
        dateTime: null,
        camera: null,
        lens: null,
        focalLength: null,
        aperture: null,
        iso: null,
        shutterSpeed: null,
      },
      suggestion: null,
    };
  }
}

