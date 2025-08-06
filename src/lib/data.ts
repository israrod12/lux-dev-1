import postgres from 'postgres';
import { createClient } from '@/supabase/client';
import {
  User,
  Profile,
  Photo,
  Video,
  CalendarEvent  
} from './definitions'; 


const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function fetchUser() {
  try {

    const data = await sql<User[]>`SELECT * FROM users`;

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch users data.');
  }
} 

export async function fetchProfile() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const profile = await sql<Profile[]>`SELECT * FROM profiles`;


    return profile;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

export async function fetchUserById(userId: string) {
  try {

    const [user] = await sql<User[]>`
      SELECT *
      FROM users 
      WHERE id = ${userId};
    `;

    return user || null;; // devuelve solo un usuario
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch user data.');
  }
}

export async function fetchProfileById(userId: string) {
  try {
    const profile = await sql<Profile[]>`
      SELECT * FROM profiles
      WHERE user_id = ${userId};
    `;
    return profile[0]; // devuelve solo un perfil
  } catch (error) {
    console.error('Database Error:', error);
    throw error;  // Re-lanzar el error original para que Next.js lo muestre completo
  }
}

export async function fetchCalendarById(userId: string) {
  try {
    const allEvents = await sql<CalendarEvent[]>`
      SELECT * FROM calendar_events
      WHERE user_id = ${userId}
      ORDER BY start_date ASC;
    `;

    return allEvents;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch calendar events.');
  }
}

