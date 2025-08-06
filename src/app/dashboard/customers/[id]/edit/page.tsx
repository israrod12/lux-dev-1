import EditAccountForm from '@/components/edit-account';
import { fetchUserById } from '@/lib/data';
import { notFound } from 'next/navigation';
import type { User } from '@/lib/definitions';



export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const user: User = await fetchUserById(id);

  if (!user) {
    notFound(); 
  }

  return (
    <main className="mx-auto max-w-xl">
      <EditAccountForm user={user} />
    </main>
  );
}
