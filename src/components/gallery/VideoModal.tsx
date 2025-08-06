'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

export default function VideoModal({
  isOpen,
  onClose,
  onUpload,
  maxVideos = 5,
  currentVideoCount = 0,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
  maxVideos?: number;
  currentVideoCount?: number;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
  const MAX_DURATION_SECONDS = 30;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (currentVideoCount >= maxVideos) {
      toast.error(`Máximo ${maxVideos} videos permitidos.`);
      return;
    }

    if (!file.type.startsWith('video/')) {
      toast.error('Solo se permiten archivos de video.');
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      toast.error('El video no puede superar los 10 MB.');
      return;
    }

    // Validar duración del video
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';

    tempVideo.onloadedmetadata = () => {
      window.URL.revokeObjectURL(tempVideo.src);
      if (tempVideo.duration > MAX_DURATION_SECONDS) {
        toast.error(`El video no puede durar más de ${MAX_DURATION_SECONDS} segundos.`);
        setSelectedFile(null);
        setPreviewUrl(null);
        e.target.value = ''; // reset input
        return;
      }
      // Si todo está bien, actualizar estado
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    };

    tempVideo.onerror = () => {
      toast.error('No se pudo cargar el video para validar duración.');
      setSelectedFile(null);
      setPreviewUrl(null);
      e.target.value = '';
    };

    tempVideo.src = URL.createObjectURL(file);
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
      setSelectedFile(null);
      setPreviewUrl(null);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onClose();
  };

  const reachedLimit = currentVideoCount >= maxVideos;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 w-[90vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg">
          <Dialog.Title className="text-lg font-semibold mb-2">Subir Video</Dialog.Title>
          <Dialog.Description className="text-sm text-gray-500 mb-4">
            Puedes subir hasta {maxVideos} videos. Actualmente tienes {currentVideoCount}. Máximo 10 MB.
          </Dialog.Description>

          {reachedLimit ? (
            <div className="text-center text-red-500 py-4">
              Has alcanzado el límite de videos permitidos.
            </div>
          ) : (
            <>
              <label className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:bg-gray-50 transition mb-4">
                <CloudArrowUpIcon className="w-10 h-10 text-gray-400" />
                <span className="mt-2 text-sm text-gray-600">
                  Haz clic para seleccionar un video
                </span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {previewUrl && (
                <video
                  src={previewUrl}
                  controls
                  className="w-48 h-auto rounded-xl shadow"
                />
              )}

              <div className="flex justify-end gap-4">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Subir
                </button>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
