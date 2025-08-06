'use client';

import {  useState } from 'react';
import { createClient } from '@/supabase/client';
import AddPhotoButton from '@/components/gallery/AddPhotoButton';
import Gallery from '@/components/gallery/gallery';
import GallerySkeleton from '@/components/ui/skeletonGallery';

type Photo = {
  id: string;
  user_id: string;
  url: string;
  is_profile: boolean;
  is_cover: boolean;
};

export default function PhotosClient({ userId, initialPhotos }: { userId: string; initialPhotos: Photo[] }) {
  const supabase = createClient();
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [loading, setLoading] = useState(false);


  const fetchPhotos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('user_id', userId)
      .eq('is_profile', false)
      .eq('is_cover', false)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPhotos(data);
    }
    setLoading(false);
  };

  const handlePhotoAdded = async () => {
    await fetchPhotos(); // Reconsulta la galería desde la base de datos
  };

  const handlePhotoDeleted = (deletedId: string) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== deletedId));
  };

  return (
    <>
      <div className="flex justify-start mb-6">
        <AddPhotoButton userId={userId} onPhotoAdded={handlePhotoAdded} />
      </div>
  
      {loading ? (
        <GallerySkeleton />
      ) : (
        <Gallery photos={photos} onPhotoDeleted={handlePhotoDeleted} />
      )}
    </>
  );
  
  
}
