'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import imageCompression from 'browser-image-compression';
import { toast } from 'sonner';


export default function GalleryPhotoModal({
  isOpen,
  onClose,
  onUpload,
  maxPhotos = 20, 
  currentPhotoCount = 0
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
  maxPhotos?: number;
  currentPhotoCount?: number;
}) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const total = currentPhotoCount + files.length;
    if (total > maxPhotos) {
      toast.error(`Máximo ${maxPhotos} imágenes. Ya tienes ${currentPhotoCount}.`);
      return;
    }

    const compressedPromises = files.map(async (file) => {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      });
      return compressed;
    });

    const compressedFiles = await Promise.all(compressedPromises);
    setSelectedFiles(compressedFiles);

    const urls = compressedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleUploadAll = () => {
    selectedFiles.forEach((file) => onUpload(file));
    setSelectedFiles([]);
    setPreviewUrls([]);
    onClose();
  };

  const handleCancel = () => {
    setSelectedFiles([]);
    setPreviewUrls([]);
    onClose();
  };

  const reachedLimit = currentPhotoCount >= maxPhotos;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 w-[90vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg">
          <Dialog.Title className="text-lg font-semibold mb-2">Subir Imágenes</Dialog.Title>
          <Dialog.Description className="text-sm text-gray-500 mb-4">
            Puedes subir hasta {maxPhotos} imágenes. Actualmente tienes {currentPhotoCount}.
          </Dialog.Description>

          {reachedLimit ? (
            <div className="text-center text-red-500 py-4">
              Has alcanzado el límite de imágenes permitidas.
            </div>
          ) : (
            <>
              <label className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:bg-gray-50 transition mb-4">
                <CloudArrowUpIcon className="w-10 h-10 text-gray-400" />
                <span className="mt-2 text-sm text-gray-600">
                  Haz clic para seleccionar imágenes
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {previewUrls.length > 0 && (
                <div
                    className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[40vh] overflow-y-auto mb-4"
                    style={{ gridAutoRows: 'auto' }}
                >
                    {previewUrls.map((url, idx) => (
                    <div
                        key={idx}
                        className="rounded-xl overflow-hidden shadow"
                    >
                        <img
                        src={url}
                        alt={`preview-${idx}`}
                        className="w-full h-auto object-cover rounded-xl"
                        />
                    </div>
                    ))}
                </div>
                )}



              <div className="flex justify-end gap-4">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUploadAll}
                  disabled={selectedFiles.length === 0}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Subir {selectedFiles.length > 0 && `(${selectedFiles.length})`}
                </button>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
 