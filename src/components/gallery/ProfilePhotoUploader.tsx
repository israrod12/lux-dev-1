'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import PhotoModal from './PhotoModal';
import { UserCircleIcon } from '@heroicons/react/24/solid';

const supabase = createClient(); // ✅ fuera del componente

export default function ProfilePhotoUploader({ userId, profileUrl }: { userId: string; profileUrl?: string }) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string | undefined>(profileUrl);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setCurrentUrl(profileUrl);
  }, [profileUrl]);

  const handleUpload = async (file: File) => {
    if (uploading) return;
    setUploading(true);

    // Mostrar imagen local preview ya aquí para mejor UX
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    const t0 = performance.now();

    const ext = file.name.split('.').pop();
    const filename = `${uuidv4()}.${ext}`;
    const path = `${userId}/${filename}`;

    //const tStartParallel = performance.now();
    // 1. Subida
    // 2. Consulta previa
    const [uploadResult, fetchResult] = await Promise.all([
      supabase.storage.from('photos').upload(path, file),
      supabase
        .from('photos')
        .select('*')
        .eq('user_id', userId)
        .eq('is_profile', true)
        .single(),
    ]);

    //const tEndParallel = performance.now();

   //console.log('⏱ Tiempo paso paralelo (subida + consulta):', (tEndParallel - tStartParallel).toFixed(2), 'ms');

    const { error: uploadError } = uploadResult;
    const { data: currentPhoto, error: fetchError } = fetchResult;

    if (uploadError) {
      alert('Error al subir archivo');
      setUploading(false);
      URL.revokeObjectURL(localUrl);
      setPreviewUrl(null);
      return;
    }

    if (fetchError && fetchError.code !== 'PGRST116') {
      alert('Error al obtener la foto anterior');
      setUploading(false);
      URL.revokeObjectURL(localUrl);
      setPreviewUrl(null);
      return;
    }

    const publicUrl = `${supabase.storage.from('photos').getPublicUrl(path).data.publicUrl}?t=${Date.now()}`;

    //const tStartDelete = performance.now();
    // 3. Borrado
    if (currentPhoto) {
      const urlParts = currentPhoto.url.split('/photos/')[1];
      const oldPath = urlParts?.split('?')[0];

      if (oldPath) {
        await supabase.storage.from('photos').remove([oldPath]);
        await supabase.from('photos').delete().eq('id', currentPhoto.id);
      }
    }
    //const tEndDelete = performance.now();

    //const tStartInsert = performance.now();
    // 4. Inserción
    const { error: insertError } = await supabase.from('photos').insert({
      id: uuidv4(),  
      user_id: userId,
      url: publicUrl,
      is_profile: true,
      is_cover: false,
    });
    //const tEndInsert = performance.now();

    if (insertError) {
      alert('Error al guardar en la base de datos');
      setUploading(false);
      URL.revokeObjectURL(localUrl);
      setPreviewUrl(null);
      return;
    }

    //const t1 = performance.now();

    /* console.log('⏱ Tiempo total:', (t1 - t0).toFixed(2), 'ms');
    console.log('🗑️ Borrado:', (tEndDelete - tStartDelete).toFixed(2), 'ms');
    console.log('📝 Inserción:', (tEndInsert - tStartInsert).toFixed(2), 'ms'); */

    // Actualiza URL pública y limpia preview
    setCurrentUrl(publicUrl);
    setUploading(false);
    setOpen(false);
    URL.revokeObjectURL(localUrl);
    setPreviewUrl(null);
  };

  return (
    <div className="flex justify-center">
      <div className="relative group w-32 h-32">
        <div
          onClick={() => setOpen(true)}
          className="cursor-pointer w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg relative bg-gray-100 hover:opacity-80"
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Preview de foto de perfil" className="w-full h-full object-cover" />
          ) : currentUrl ? (
            <img src={currentUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
          ) : (
            <UserCircleIcon className="w-full h-full text-gray-300" />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-sm text-white transition-opacity">
            Cambiar foto
          </div>
        </div>

        {open && (
          <PhotoModal
            isOpen={open}
            onClose={() => setOpen(false)}
            onUpload={handleUpload}
          />
        )}
        
      </div>
    </div>
  );
}
