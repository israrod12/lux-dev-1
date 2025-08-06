'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import CoverPhotoModal from './CoverPhotoModal';

const supabase = createClient();

export default function CoverPhotoUploader({ userId, coverUrl }: { userId: string; coverUrl?: string }) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string | undefined>(coverUrl);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setCurrentUrl(coverUrl);
  }, [coverUrl]);

  const handleUpload = async (file: File) => {
    if (uploading) return;
    setUploading(true);

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    const ext = file.name.split('.').pop();
    const filename = `${uuidv4()}.${ext}`;
    const path = `${userId}/${filename}`;

    const [uploadResult, fetchResult] = await Promise.all([
      supabase.storage.from('photos').upload(path, file),
      supabase
        .from('photos')
        .select('*')
        .eq('user_id', userId)
        .eq('is_cover', true)
        .maybeSingle(),
    ]);

    const { error: uploadError } = uploadResult;
    const { data: currentPhoto, error: fetchError } = fetchResult;

    if (uploadError) {
      alert('Error al subir archivo');
      cleanup();
      return;
    }

    if (fetchError) {
      console.error('Fetch error:', fetchError);
    }

    if (fetchError && fetchError.code !== 'PGRST116') {
      alert('Error al obtener la portada anterior');
      cleanup();
      return;
    }

    const publicUrl = `${supabase.storage.from('photos').getPublicUrl(path).data.publicUrl}?t=${Date.now()}`;

    if (currentPhoto) {
      const urlParts = currentPhoto.url.split('/photos/')[1];
      const oldPath = urlParts?.split('?')[0];

      if (oldPath) {
        await supabase.storage.from('photos').remove([oldPath]);
        await supabase.from('photos').delete().eq('id', currentPhoto.id);
      }
    }

    const { error: insertError } = await supabase.from('photos').insert({
      id: uuidv4(),  
      user_id: userId,
      url: publicUrl,
      is_profile: false,
      is_cover: true,
    });

    if (insertError) {
      console.error('insertError:', insertError);
    }

    if (insertError) {
      alert('Error al guardar en la base de datos'); 
      cleanup();
      return;
    }

    setCurrentUrl(publicUrl);
    setUploading(false);
    setOpen(false);
    URL.revokeObjectURL(localUrl);
    setPreviewUrl(null);
  };

  const cleanup = () => {
    setUploading(false);
    setOpen(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto mt-6">
      {/* Portada */}
      <div className="aspect-[3/1] bg-gray-100 rounded-lg overflow-hidden group shadow-md">
        <div
          onClick={() => setOpen(true)}
          className="cursor-pointer w-full h-full relative hover:opacity-80 transition-opacity"
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview portada"
              className="w-full h-full object-cover"
            />
          ) : currentUrl ? (
            <img
              src={currentUrl}
              alt="Portada actual"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              Agregar portada
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm">
            Cambiar portada
          </div>
        </div>
      </div>
  
      {open && (
        <CoverPhotoModal
          isOpen={open}
          onClose={() => setOpen(false)}
          onUpload={handleUpload}
        />
      )}
    </div>
  );  
}
