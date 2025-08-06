import { createClient } from '@/supabase/client';
import { auth } from "@/lib/auth";

import ProfilePhotoUploader from '@/components/gallery/ProfilePhotoUploader';
import CoverPhotoUploader from '@/components/gallery/CoverPhotoUploader';
import PhotosClient from '@/components/gallery/PhotosClient';


export default async function Page() { 

  const session = await auth();
  const userId = session?.user?.id;

   if (!userId) {
    return <p className="text-center mt-10">Inicia sesión para ver o subir fotos</p>;
  }

  const supabase = createClient();

  const { data: photos } = await supabase
    .from('photos')
    .select('*') 
    .eq('user_id', userId)
    .order('created_at', { ascending: false }); 

  const profilePhoto = photos?.find(p => p.is_profile);
  const coverPhoto = photos?.find(p => p.is_cover);
  const galleryPhotos = photos?.filter(p => !p.is_profile && !p.is_cover) ?? [];

  return (
    <main className="p-8 max-w-5xl mx-auto space-y-10">
        <div className="relative">
          <CoverPhotoUploader userId={userId} coverUrl={coverPhoto?.url} />
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
            <ProfilePhotoUploader userId={userId} profileUrl={profilePhoto?.url} />
          </div>
        </div>

        <div style={{ height: 20 }} />
        <PhotosClient userId={userId} initialPhotos={galleryPhotos} />
    </main>
  );
}
