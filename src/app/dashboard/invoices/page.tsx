// app/customers/page.tsx
import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function CustomersPage() {
  const session = await auth();

  const userId = session?.user?.id;

  console.log('URL a la que se dirigirá:', `/invoices/${userId}`);

  return (
    <div>
      <h1>Profile</h1>
      {userId ? ( 
        <Link href={`/dashboard/invoices/${userId}/edit`}>
          <button>Ir a mi perfil</button>
        </Link>
      ) : (
        <p>No estás logeado.</p>
      )}
    </div>
  );
}
