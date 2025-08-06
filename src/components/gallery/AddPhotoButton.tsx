'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import GalleryPhotoModal from './GalleryPhotoModal';
import VideoModal from './VideoModal';
import { PhotoIcon, VideoCameraIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { toast } from 'sonner';


type Video = {
  id: string;
  user_id: string;
  url: string;
};

export default function AddMediaButtons({
  userId,
  onPhotoAdded,
}: {
  userId: string;
  onPhotoAdded: () => void;
}) {
  const [openPhoto, setOpenPhoto] = useState(false);
  const [openVideo, setOpenVideo] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);
  const [videoCount, setVideoCount] = useState(0);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loadingVideos, setLoadingVideos] = useState(false);


  const supabase = createClient();

  const fetchPhotoCount = async () => {
    const { count, error } = await supabase
      .from('photos')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_profile', false)
      .eq('is_cover', false);
    if (!error && typeof count === 'number') setPhotoCount(count);
  };

  const fetchVideos = async () => {

    const { data, error, count } = await supabase
      .from('videos')
      .select('id, user_id, url', { count: 'exact' })
      .eq('user_id', userId);
    if (!error && data) {
      setVideos(data);
      setVideoCount(count ?? 0);
    }
  };

  useEffect(() => {
    if (openPhoto) fetchPhotoCount();
  }, [openPhoto]);

  useEffect(() => {
    if (openVideo) fetchVideos();
  }, [openVideo]);

  // También traer videos al montar para mostrar miniaturas
  useEffect(() => {
    fetchVideos();
  }, []);

  const handleUploadPhoto = async (file: File) => {
    if (uploading) return;
    setUploading(true);

    const ext = file.name.split('.').pop();
    const filename = `${uuidv4()}.${ext}`;
    const path = `${userId}/${filename}`;

    const { error: uploadError } = await supabase.storage.from('photos').upload(path, file);
    if (uploadError) {
      alert('Error al subir la imagen');
      setUploading(false);
      return;
    }

    const { data: publicData } = supabase.storage.from('photos').getPublicUrl(path);
    if (!publicData?.publicUrl) {
      alert('Error al obtener URL pública');
      setUploading(false);
      return;
    }

    const { error: insertError } = await supabase.from('photos').insert({
      id: uuidv4(), 
      user_id: userId,
      url: `${publicData.publicUrl}?t=${Date.now()}`,
      is_profile: false,
      is_cover: false,
    });

    if (insertError) {
      alert('Error al guardar en base de datos');
    } else {
      await onPhotoAdded();
      fetchPhotoCount();
    }
    setUploading(false);
  };

  const handleUploadVideo = async (file: File) => {
    if (uploading) return;
    setUploading(true);
  
    if (videoCount >= 5) {
      toast.error('Solo puedes subir un máximo de 5 videos');
      setUploading(false);
      return;
    }
   
    // Crear preview local para mostrar inmediatamente
    const localPreviewUrl = URL.createObjectURL(file);
  
    // Añadir el video local a la lista para preview inmediato
    setVideos(prev => [
      ...prev,
      {
        id: 'local-' + uuidv4(),
        user_id: userId,
        url: localPreviewUrl,
      },
    ]);
    setVideoCount(prev => prev + 1);
  
    const ext = file.name.split('.').pop();
    const filename = `${uuidv4()}.${ext}`;
    const path = `${userId}/${filename}`;
  
    const { error: uploadError } = await supabase.storage.from('videos').upload(path, file);
    if (uploadError) {
      alert('Error al subir el video');
      setUploading(false);
      setLoadingVideos(false);
      return;
    }
  
    const { data: publicData } = supabase.storage.from('videos').getPublicUrl(path);
    if (!publicData?.publicUrl) {
      alert('Error al obtener URL pública');
      setUploading(false);
      setLoadingVideos(false);
      return;
    }
  
    const { error: insertError } = await supabase.from('videos').insert({
      id: uuidv4(), 
      user_id: userId,
      url: `${publicData.publicUrl}?t=${Date.now()}`,
    });
  
    if (insertError) {
      alert('Error al guardar en base de datos');
    } else {
      // Actualizar lista desde DB, reemplazando el preview local por la url real
      await fetchVideos();
    }
  
    // Revocar el URL temporal para liberar memoria
    URL.revokeObjectURL(localPreviewUrl);
  
    setUploading(false);
  };
  

  const handleDeleteVideo = async (videoId: string) => {
    // Buscar el video para obtener la URL
    const { data: videoData, error: fetchError } = await supabase
      .from('videos')
      .select('url')
      .eq('id', videoId)
      .single();
  
    if (fetchError || !videoData) {
      toast.error('No se encontró el video para eliminar');
      return;
    }
  
    // Extraer el path del video en el storage desde la URL
    // Ejemplo: si la URL es https://xyz.supabase.co/storage/v1/object/public/videos/userId/archivo.mp4?t=1234
    // queremos extraer 'userId/archivo.mp4'
  
    try {
      const url = new URL(videoData.url);
      // La URL pública usualmente tiene la forma:
      // https://xyz.supabase.co/storage/v1/object/public/videos/userId/archivo.mp4
      // La ruta es el pathname después de /object/public/videos/
      const publicPrefix = '/storage/v1/object/public/videos/';
      const index = url.pathname.indexOf(publicPrefix);
      if (index === -1) throw new Error('URL no válida');
  
      const path = url.pathname.substring(index + publicPrefix.length);
  
      // Borrar archivo del storage
      const { error: storageError } = await supabase.storage
        .from('videos')
        .remove([path]);
  
      if (storageError) {
        toast.error('Error al eliminar el archivo del almacenamiento');
        return;
      }
  
      // Borrar registro de la base de datos
      const { error: dbError } = await supabase.from('videos').delete().eq('id', videoId);
  
      if (dbError) {
        toast.error('Error al eliminar el video de la base de datos');
        return;
      }
  
      // Refrescar lista y limpiar video seleccionado
      await fetchVideos();
      if (selectedVideo?.id === videoId) setSelectedVideo(null);
      toast.success('Video eliminado correctamente');
  
    } catch (err) {
      toast.error('Error al procesar la eliminación del video');
    }
  };
  

  return (
    <>
      <div className="flex flex-col space-y-4 mb-6">
       {/* Botones de carga de imágenes y videos en una sola fila */}
        <div className="flex flex-row items-start gap-6 mb-6">
          {/* Botón Fotos */}
          <div className="flex flex-col items-center">
            <div
              onClick={() => setOpenPhoto(true)}
              role="button"
              tabIndex={0}
              aria-label="Subir imágenes a la galería"
              className="w-28 h-28 flex items-center justify-center border-2 border-dashed border-gray-400 rounded-xl cursor-pointer hover:bg-gray-100 hover:border-gray-600 transition select-none"
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') setOpenPhoto(true);
              }}
            >
              <PhotoIcon className="h-10 w-10 text-black hover:text-gray-700 transition" />
            </div>
            <span className="text-sm text-gray-600 mt-2 select-none">Insertar imágenes</span>
          </div>

          {/* Botón Videos */}
          <div className="flex flex-col items-center">
            <div
              onClick={() => {
                if (videoCount < 5) setOpenVideo(true);
                else toast.error('Solo puedes subir un máximo de 5 videos');
              }}
              role="button"
              tabIndex={0}
              aria-label="Subir videos a la galería"
              className={`w-28 h-28 flex items-center justify-center border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-100 hover:border-gray-600 transition select-none
                ${videoCount >= 5 ? 'border-red-500 cursor-not-allowed opacity-50' : 'border-gray-400'}
              `}
              onKeyDown={e => {
                if ((e.key === 'Enter' || e.key === ' ') && videoCount < 5) setOpenVideo(true);
              }}
            >
              <VideoCameraIcon className="h-10 w-10 text-black hover:text-gray-700 transition" />
            </div>
            <span className="text-sm text-gray-600 mt-2 select-none">
              Insertar videos ({videoCount}/5)
            </span>
          </div>
        </div>

        {/* Miniaturas de videos */}
        {/* Miniaturas de videos o skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {videos.map(video => (
              <div
                key={video.id}
                className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-300 cursor-pointer group"
                onClick={() => setSelectedVideo(video)}
                title="Ver video en grande"
              >
                <video
                  src={video.url}
                  className="w-full h-full object-cover"
                  muted
                />
                <div className="absolute top-1 left-1 bg-black bg-opacity-60 rounded-full p-1">
                  <VideoCameraIcon className="h-5 w-5 text-white" />
                </div>
                <button
                  type="button"
                  aria-label="Eliminar video"
                  onClick={e => {
                    e.stopPropagation();
                    toast('¿Seguro que quieres eliminar este video?', {
                      action: {
                        label: 'Eliminar',
                        onClick: () => handleDeleteVideo(video.id),
                      },
                    });
                  }}                  
                  className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                >
                  <XMarkIcon className="h-5 w-5 text-white" />
                </button>
              </div>
            ))}
        </div>

      </div>

      {/* Modales */}
      {openPhoto && (
        <GalleryPhotoModal
          isOpen={openPhoto}
          onClose={() => setOpenPhoto(false)}
          onUpload={handleUploadPhoto}
          currentPhotoCount={photoCount}
          maxPhotos={20}
        />
      )}

      {openVideo && (
        <VideoModal
          isOpen={openVideo}
          onClose={() => setOpenVideo(false)}
          onUpload={handleUploadVideo}
          currentVideoCount={videoCount}
          maxVideos={5}
        />
      )}

      {/* Popup para video seleccionado */}
      {selectedVideo && (
        <div
          onClick={() => setSelectedVideo(null)}
          className="fixed inset-0 bg-black bg-opacity-80 flex items-start justify-center z-50 cursor-pointer pt-16" // pt-16 para bajar un poco desde arriba
          aria-modal="true"
          role="dialog"
        >
            <div
              onClick={e => e.stopPropagation()}
              className="
              relative
              max-w-[90vw] max-h-[60vh]   /* para móvil pequeño (ej. 490px) */
              sm:max-w-[70vw] sm:max-h-[50vh]  /* para sm (>=640px) tamaño mediano */
              md:max-w-[50vw] md:max-h-[40vh]  /* para md (>=768px) tamaño algo más pequeño */
              lg:max-w-[30vw] lg:max-h-[30vh]  /* para lg (>=1024px) tamaño pequeño */
              w-full
              rounded-lg
              bg-black
              "
            >
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-2 right-2 z-10 bg-black bg-opacity-50 rounded-full p-1 hover:bg-opacity-80"
              aria-label="Cerrar video"
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
            <video
              src={selectedVideo.url}
              controls
              autoPlay
              className="w-full h-full rounded-lg object-contain"
            />
          </div>
        </div>
      )}


    </>
  );
}
