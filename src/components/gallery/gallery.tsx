'use client';

import Image from 'next/image';
import { TrashIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { createClient } from '@/supabase/client';

type Photo = {
  id: string;
  url: string;
  is_profile: boolean;
  is_cover: boolean;
};

type Props = {
  photos: Photo[];
  onPhotoDeleted?: (photoId: string) => void;
};

export default function Gallery({ photos, onPhotoDeleted }: Props) {
  const supabase = createClient();
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  const handleDelete = async (photo: Photo) => {
    if (!photo.url || deletingIds.includes(photo.id)) return;

    const urlParts = photo.url.split('/photos/')[1]?.split('?')[0];
    if (!urlParts) return;

    setDeletingIds((ids) => [...ids, photo.id]);

    try {
      const { error: storageError } = await supabase.storage.from('photos').remove([urlParts]);
      if (storageError) throw storageError;

      const { error: dbError } = await supabase.from('photos').delete().eq('id', photo.id);
      if (dbError) throw dbError;

      onPhotoDeleted?.(photo.id); // Notifica al padre
    } catch (error) {
      console.error('Error eliminando la foto:', error);
    } finally {
      setDeletingIds((ids) => ids.filter((id) => id !== photo.id));
    }
  };

  if (photos.length === 0) {
    return <div className="text-center text-gray-500">No hay fotos para mostrar.</div>;
  }

  return (
    <div className="columns-2 md:columns-3 gap-4 space-y-4">
      {photos.map((photo) => (
        <div key={photo.id} className="relative w-full break-inside-avoid rounded-xl overflow-hidden group shadow">
          <Image
            src={photo.url}
            alt="Photo"
            width={500}
            height={500}
            className="w-full h-auto object-cover rounded-xl transition-transform duration-300 ease-in-out group-hover:scale-105"
            loading="lazy"
          />
          <button
            disabled={deletingIds.includes(photo.id)}
            onClick={() => handleDelete(photo)}
            className={`absolute top-2 right-2 bg-black bg-opacity-50 p-1 rounded-full text-white hover:bg-opacity-80 transition ${
              deletingIds.includes(photo.id) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label="Eliminar foto"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      ))}
    </div>
  );
}
