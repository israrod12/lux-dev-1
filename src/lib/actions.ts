'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export type State = { 
  errors?: {
    firstName?: string[];
    lastName?: string[];
    email?: string[];
    password?: string[];
  };
  message?: string | null;
};

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const UserSchema = z.object({
  id: z.string(),
  firstName: z.string({
    invalid_type_error: 'Must be a valid first name',
  })
  .trim()
  .nonempty('First name is required')
  .min(2, 'First name must be at least 2 characters')
  .regex(/^[A-Za-z\s'-]+$/, 'First name must contain only letters'),

  lastName: z.string({
    invalid_type_error: 'Must be a valid last name',
  })
  .trim()
  .nonempty('Last name is required')
  .min(2, 'Last name must be at least 2 characters')
  .regex(/^[A-Za-z\s'-]+$/, 'First name must contain only letters'),

  email: z.string({
    invalid_type_error: 'Must be a valid email',
  })
  .trim()
  .nonempty('Email is required')
  .email('Invalid email address'),

  password: z.string({
    invalid_type_error: 'Must be a valid password',
  })
  .trim()
  .nonempty('Password is required')
  .regex(
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
    'Password must be at least 8 characters and include one uppercase letter, one number, and one special character'
  ),
  created_at: z.string(),
});
 
//Create User

const RegisterUser = UserSchema.omit({ id: true, created_at: true });

export async function registerUser(prevState: State = {}, formData: FormData) {
  // Validar formulario con Zod
  const validated = RegisterUser.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Try again.',
    };
  }

  const { firstName, lastName, email, password } = validated.data;

  // Hashear contraseña
  const passwordHash = await bcrypt.hash(password, 10);

  // Insertar usuario en DB
  try {
    await sql`
      INSERT INTO users (first_name, last_name, email, password)
      VALUES (${firstName}, ${lastName}, ${email}, ${passwordHash})
    `;
  } catch (error: any) {
    if (error.code === '23505') {
      // Código Postgres para violación de restricción única (ej. email duplicado)
      return {
        errors: { email: ['Email already registered'] },
        message: 'Email is already in use.',
      };
    }
    return {
      message: 'Database error: could not create user.',
    };
  }

  // Revalidar la página que muestre usuarios o login, o la de registro para limpiar cache
  revalidatePath('/register');
  redirect('/login');  
}

//Update User

const UpdateUserSchema = z.object({
  id: UserSchema.shape.id,
  firstName: UserSchema.shape.firstName,
  lastName: UserSchema.shape.lastName,
  email: UserSchema.shape.email,
  password: z
    .string()
    .trim()
    .optional()
    .refine(val => !val || (
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(val)
    ), {
      message: 'Password must be at least 8 characters and include one uppercase letter, one number, and one special character'
    }),
  created_at: UserSchema.shape.created_at
});

const UpdateUser = UpdateUserSchema.omit({ id: true, created_at: true });

async function updateDynamic(
  tableName: string,
  idColumn: string,
  idValue: string | number,
  data: Record<string, any>
) {
  if (!data || Object.keys(data).length === 0) {
    return { message: 'No fields to update.' };
  }

  const setParts = [];
  const values = [];

  for (const [field, value] of Object.entries(data)) {
    setParts.push(`${field} = $${values.length + 1}`);
    values.push(value);
  }

  // Para el id
  values.push(idValue);
  //console.log('tableName', tableName);
  //console.log('setParts:', setParts.join(', '));
  //console.log('idColumn', idColumn);
  //console.log('Número de valores:', values.length);
  //console.log('Valores que se enviarán a la DB:', values);

  const query = `
    UPDATE ${tableName}
    SET ${setParts.join(', ')}
    WHERE ${idColumn} = $${values.length}
  `;

  try {
    await sql.unsafe(query, values);
    return { message: 'Update successful.' };
  } catch (error: any) {
    console.error('Database update error:', error);
    return { message: 'Database error: failed to update.' };
  }
}

export async function updateUser(
  id: string,
  prevState: State = {},
  formData: FormData,
) {
  const validated = UpdateUser.partial().safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Try once more.',
    };
  }
  const dataToUpdate: Record<string, any> = {};

  const { firstName, lastName, email, password } = validated.data;

  if (firstName) dataToUpdate.first_name = firstName;
  if (lastName) dataToUpdate.last_name = lastName;
  if (email) dataToUpdate.email = email;
  if (password && password.trim() !== '') {
    dataToUpdate.password = await bcrypt.hash(password, 10);
  }

  const result = await updateDynamic('users', 'id', id, dataToUpdate);

  if (result.message?.startsWith('Database error')) {
    return { message: result.message };
  }

  revalidatePath('/dashboard/customers');
  redirect('/dashboard/');
}

//Update Profile

const UpdateProfileSchema = z.object({
  model_name: z.string({
    invalid_type_error: 'Must be a valid model name',
  })
  .trim()
  .nonempty('Model name is required')
  .min(2, 'Model name must be at least 2 characters'),

  location: z.string({
    invalid_type_error: 'Must be a valid location',
  })
  .trim()
  .nonempty('Location is required')
  .min(2, 'Location must be at least 2 characters'),

  nationality: z.string({
    invalid_type_error: 'Must be a valid nationality',
  })
  .trim()
  .nonempty('Nationality is required')
  .min(2, 'Nationality must be at least 2 characters'),

  age: z.preprocess(
    (val) => val === '' ? null : Number(val),
    z.number({
      invalid_type_error: 'Age must be a number',
    })
    .int('Age must be an integer')
    .min(0, 'Age cannot be negative')
    .max(100, 'Age cannot be over 100')
    .nullable()
  ),

  eye_color: z.string({
    invalid_type_error: 'Must be a valid eye color',
  })
  .trim()
  .nullable(),

  bust_size: z.string({
    invalid_type_error: 'Must be a valid bust size',
  })
  .trim()
  .nullable(),

  hip_size: z.string({
    invalid_type_error: 'Must be a valid hip size',
  })
  .trim()
  .nullable(),

  weight_kg: z.preprocess(
    (val) => val === '' ? null : Number(val),
    z.number({
      invalid_type_error: 'Weight must be a number',
    })
    .min(0, 'Weight cannot be negative')
    .nullable()
  ),

  height_cm: z.preprocess(
    (val) => val === '' ? null : Number(val),
    z.number({
      invalid_type_error: 'Height must be a number',
    })
    .min(0, 'Height cannot be negative')
    .nullable()
  ),

  language: z.array(z.string({
    invalid_type_error: 'Each language must be a string',
  })).nullable().default([]),

  description: z.string({
    invalid_type_error: 'Description must be a string',
  })
  .trim()
  .nullable(),

  social: z.object({
    twitter: z.string().trim().nullable(),
    instagram: z.string().trim().nullable(),
    telegram: z.string().trim().nullable(),
    whatsapp: z.string().trim().nullable(),
    web: z.string().trim().nullable(),
  }).nullable().default({
    twitter: null,
    instagram: null,
    telegram: null,
    whatsapp: null,
    web: null,
  }),
});



export async function updateProfile(
  id: string,
  formData: FormData
): Promise<{ errors?: any; message: string }> {

  let languages = formData.getAll('language');
  if (languages.length === 1 && languages[0] === '') {
    languages = [];
  }

  const parsedData = {
    model_name: formData.get('model_name') || null,
    location: formData.get('location') || null,
    nationality: formData.get('nationality') || null,
    age: formData.get('age') || null,
    eye_color: formData.get('eye_color') || null,
    bust_size: formData.get('bust_size') || null,
    hip_size: formData.get('hip_size') || null,
    weight_kg: formData.get('weight_kg') || null,
    height_cm: formData.get('height_cm') || null,
    language: languages.length > 0 ? (languages as string[]) : [],
    description: formData.get('description') || null,
    social: {
      twitter: formData.get('twitter') || null,
      instagram: formData.get('instagram') || null,
      telegram: formData.get('telegram') || null,
      whatsapp: formData.get('whatsapp') || null,
      web: formData.get('web') || null,
    }
  };

  /* for (const pair of formData.entries()) {
    console.log('FormData:', pair[0], '=', pair[1]);
  } */
  
  const validated = UpdateProfileSchema.partial().safeParse(parsedData);

  if (!validated.success) {
   // console.log('Validation errors:', validated.error.flatten().fieldErrors);
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Please fix the errors.',
    };
  }
  

  const cleanData = Object.fromEntries(
    Object.entries(validated.data).filter(([_, v]) => v !== undefined && v !== null)
  );

  const result = await updateDynamic('profiles', 'user_id', id, cleanData);

  if (result.message?.startsWith('Database error')) {
    return {
      errors: {},
      message: result.message,
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/');
}

//Onboarding - Create Profile

type ProfileState = {
  errors?: {
    model_name?: string[];
    location?: string[];
    nationality?: string[];
  };
  message?: string;
};


const ProfileSchema = z.object({
  model_name: z
    .string({
      invalid_type_error: 'Must be a valid model name',
    })
    .trim()
    .nonempty('Model name is required')
    .min(2, 'Model name must be at least 2 characters'),

  location: z
    .string({
      invalid_type_error: 'Must be a valid location',
    })
    .trim()
    .nonempty('Location is required')
    .min(2, 'Location must be at least 2 characters'),

  nationality: z
    .string({
      invalid_type_error: 'Must be a valid nationality',
    })
    .trim()
    .nonempty('Nationality is required')
    .min(2, 'Nationality must be at least 2 characters'),
});

export async function completeOnboarding(
  userId: string,
  formData: FormData
): Promise<ProfileState> {
  const validated = ProfileSchema.safeParse({
    model_name: formData.get('model_name'),
    location: formData.get('location'),
    nationality: formData.get('nationality'),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Invalid input.',
    };
  }

  const { model_name, location, nationality } = validated.data;

  try {
    await sql`
      INSERT INTO profiles (user_id, model_name, location, nationality)
      VALUES (${userId}, ${model_name}, ${location}, ${nationality})
    `;

    await sql`
      UPDATE users
      SET onboarding_complete = true
      WHERE id = ${userId}
    `;

    revalidatePath('/onboarding'); // esto sí puede quedar
    
  } catch (error: any) {
    if (error.code === '23505') {
      return { message: 'Profile already exists.' };
    }

    return { message: `Database error: ${error.message ?? 'Unknown error'}` };
  }

  return { message: 'ok' }; // <- puedes usar esto para redirigir luego
}

