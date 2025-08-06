import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Area } from 'react-easy-crop';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// app/ui/gallery/utils/cropImage.ts
export const getCroppedImg = (imageSrc: string, crop: any): Promise<File> => {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      ); 
      canvas.toBlob((blob) => {
        if (!blob) return;
        resolve(new File([blob], 'cropped.jpg', { type: 'image/jpeg' }));
      }, 'image/jpeg');
    };
  });
};

export async function getCroppedCoverImg(
  imageSrc: string,
  pixelCrop: Area,
  outputWidth?: number,
  outputHeight?: number
): Promise<File> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');

  canvas.width = outputWidth ?? pixelCrop.width;
  canvas.height = outputHeight ?? pixelCrop.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo obtener contexto canvas');

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return await new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) throw new Error('Error creando blob');
      resolve(new File([blob], 'cropped.jpeg', { type: 'image/jpeg' }));
    }, 'image/jpeg');
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}
