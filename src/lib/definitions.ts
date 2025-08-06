// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.
// This file contains updated type definitions for your data.
// It reflects the latest database schema.

export type User = {
  id: string;           // UUID
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  onboarding_complete: boolean; // 👈 importante
  created_at: string;   // TIMESTAMP as ISO string
}; 

export type Profile = { 
  id: string;           // UUID generado por la DB
  user_id: string;      // UUID FK
  model_name: string;
  location: string;
  nationality: string;
  age: number | null;
  eye_color: string | null;
  bust_size: string | null;
  hip_size: string | null;
  weight_kg: number | null; 
  height_cm: number | null;
  language: string[] | null;  // TEXT[]
  description: string | null;
  social: {
    twitter?: string; 
    instagram?: string;
    telegram?: string;
    whatsapp?: string;
    web?: string;
  } | null;
  created_at: string;   // TIMESTAMP as ISO string
};

export type Photo = {
  id: string;           // UUID
  user_id: string;
  url: string;
  is_profile: boolean;
  is_cover: boolean;
  position: number;
  created_at: string;   // TIMESTAMP as ISO string
};

export type Video = {
  id: string;           // UUID
  user_id: string;
  url: string;
  created_at: string;
};

export type CalendarEvent = {
  id: string;           // UUID
  user_id: string;
  country: string;
  place: string;
  start_date: string;   // DATE as ISO string
  end_date: string;     // DATE as ISO string
  created_at: string;   // TIMESTAMP as ISO string
};
