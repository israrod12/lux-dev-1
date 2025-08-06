'use client';

import { useCallback, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/lib/utils';
import type { Area } from 'react-easy-crop';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import imageCompression from 'browser-image-compression';


export default function PhotoModal({
  isOpen,
  onClose,
  onUpload,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
}) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback(
    (_: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
  
    const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
  
    const compressed = await imageCompression(croppedImage, {
      maxSizeMB: 1,
      maxWidthOrHeight: 800,
      useWebWorker: true,
    });
  
    onUpload(compressed); // ahora se sube comprimida
    onClose();
  };
  

  const handleCancel = () => {
    setImageSrc(null);
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg">
        <Dialog.Title className="text-lg font-semibold mb-2">Subir Imagen</Dialog.Title>
        <Dialog.Description className="text-sm text-gray-500 mb-4">
            Se recomienda subir una foto de 500 x 500 píxeles
        </Dialog.Description>
        {!imageSrc ? (
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:bg-gray-50 transition">
                <CloudArrowUpIcon className="w-10 h-10 text-gray-400" />
                <span className="mt-2 text-sm text-gray-600">Haz clic para subir una imagen</span>
                <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                />
            </label>
        ) : (
            <>
            <div className="relative w-full aspect-square bg-gray-100 rounded-md overflow-hidden">
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    minZoom={1}
                    maxZoom={3}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                />
                {/* Máscara circular */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-full h-full max-w-[36rem] max-h-[36rem] rounded-full border-2 border-white shadow-inner" />
                </div>
            </div>
            <div className="flex justify-end gap-4 mt-4">
                <button
                onClick={handleCancel}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                Cancelar
                </button>
                <button
                onClick={handleSave}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                Guardar
                </button>
            </div>
            </>
        )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
