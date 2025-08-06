  export type Social = {
    twitter?: string;
    instagram?: string;
    telegram?: string;
    whatsapp?: string;
    web?: string;
  };
  
  export type UserProfile = {
    user_id: string;
    model_name: string;
    location: string;
    nationality: string;
    age: number;
    eye_color: string;
    bust_size: string;
    hip_size: string;
    weight_kg: number;
    height_cm: number;
    language: string | string[];
    description: string;
    social: Social;
  };