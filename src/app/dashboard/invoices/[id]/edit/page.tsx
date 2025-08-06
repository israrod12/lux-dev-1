import EditProfileForm from '@/components/edit-profile';
import { fetchProfileById } from '@/lib/data';
import { notFound } from 'next/navigation';
import type { Profile } from '@/lib/definitions';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const profile: Profile = await fetchProfileById(id);

  if (!profile) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-xl">
      <EditProfileForm
        profile={{
          ...profile,
          age: profile.age ?? 18,
          eye_color: profile.eye_color ?? '',
          bust_size: profile.bust_size ?? '',
          hip_size: profile.hip_size ?? '',
          weight_kg: profile.weight_kg ?? 0,
          height_cm: profile.height_cm ?? 0,
          language: profile.language ?? [],
          description: profile.description ?? '',
          social: profile.social ?? {},
        }}
      />

    </main>
  ); 
}
