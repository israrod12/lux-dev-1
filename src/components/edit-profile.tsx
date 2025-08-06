'use client';

import { useState } from 'react';
import {
  UserIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  LinkIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon, ExclamationCircleIcon } from '@heroicons/react/20/solid';
import { Button } from '@/components/ui/button';
import { useActionState } from 'react';
import { updateProfile } from '@/lib/actions';
import { FaTwitter, FaInstagram, FaTelegramPlane, FaWhatsapp, FaGlobe } from 'react-icons/fa';
import { Social, UserProfile} from '@/lib/types';


export type State = {
  errors?: {
    model_name?: string[];
    location?: string[];
    nationality?: string[];
    age?: string[];
    eye_color?: string[];
    bust_size?: string[];
    hip_size?: string[];
    weight_kg?: string[];
    height_cm?: string[];
    language?: string[];
    description?: string[];
    social?: {
      twitter?: string[];
      instagram?: string[];
      telegram?: string[]; 
      whatsapp?: string[];
      web?: string[];
    };
  };
  message?: string;
}; 

export default function EditProfileForm({ profile }: { profile: UserProfile }) {
  const [modelName, setModelName] = useState(profile.model_name || '');
  const [location, setLocation] = useState(profile.location || '');
  const [nationality, setNationality] = useState(profile.nationality || '');
  const [age, setAge] = useState<string>(profile.age?.toString() || '18');
  const [eyeColor, setEyeColor] = useState(profile.eye_color || '');
  const [bustSize, setBustSize] = useState(profile.bust_size || '');
  const [hipSize, setHipSize] = useState(profile.hip_size || '');
  const [weightKg, setWeightKg] = useState(profile.weight_kg?.toString() || '');
  const [heightCm, setHeightCm] = useState(profile.height_cm?.toString() || '');


  // Normalizamos el estado language para evitar problemas con espacios o mayúsculas
  const [language, setLanguage] = useState<string[]>(() => {
    if (Array.isArray(profile.language)) {
      // Si es un array con un solo string que contiene comas, lo dividimos
      if (profile.language.length === 1 && profile.language[0].includes(',')) {
        return profile.language[0]
          .split(',')
          .map((s) => s.trim().toLowerCase());
      }
      // Si es un array normal de strings separados 
      return profile.language.map((l) => l.trim().toLowerCase());
    } else if (typeof profile.language === 'string') {
      return profile.language.split(',').map((s) => s.trim().toLowerCase());
    }
    return [];
  });
  
  const [description, setDescription] = useState(profile.description || '');
  const [social, setSocial] = useState<Social>(profile.social || {});

  const handleUpdate = async (prevState: State, formData: FormData) => {
    const age = formData.get('age')?.toString().trim();
  
    if (!age) {
      // Si está vacío, eliminarlo o forzar a 18
      formData.set('age', '18'); // Forzar a 18
      // formData.delete('age'); // O eliminarlo por completo para que se use el default
    }
  
    return updateProfile(profile.user_id, formData);
  };
  

  const [state, formAction, isPending] = useActionState(handleUpdate, {
    errors: {},
    message: '',
  });

  function updateSocialField(field: keyof Social, value: string) {
    setSocial((prev) => ({ ...prev, [field]: value }));
  }

  const estadosMexico = [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Coahuila', 'Colima',
    'Chiapas', 'Chihuahua', 'Ciudad de México', 'Durango', 'Guanajuato', 'Guerrero',
    'Hidalgo', 'Jalisco', 'México', 'Michoacán', 'Morelos', 'Nayarit',
    'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí',
    'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz',
    'Yucatán', 'Zacatecas'
  ];
  
  const nacionalidades = ['Colombiana', 'Venezolana', 'Brasileña', 'Mexicana'];
  

  const bustSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const eyeColors = ['Brown', 'Blue', 'Green', 'Gray', 'Hazel'];
  const hipSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Lista de idiomas en minúsculas para comparación
  const languagesList = ['spanish', 'english', 'german', 'french', 'italian', 'portuguese', 'russian'];

  return (
    <form
    action={formAction}
    className="space-y-6 rounded-lg p-6"
    style={{ backgroundColor: '#F9F1F0', color: '#000000' }}
  >
    <h1 className="mb-4 text-2xl font-semibold">Edit your profile</h1>

    {/* Model Name */}
    <div>
      <label
        htmlFor="model_name"
        className="mb-1 block text-xs font-medium"
        style={{ color: '#000000' }}
      >
        Model Name
      </label>
      <div className="relative">
        <input
          id="model_name"
          name="model_name"
          type="text"
          required
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          className="peer block w-full rounded-md border py-2 pl-10 text-sm"
          style={{ backgroundColor: '#ffffff', borderColor: '#F8AFA6', color: '#000000' }}
        />
        <UserIcon
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2"
          style={{ color: '#000000' }}
        />
      </div>
      {state?.errors?.model_name?.[0] && (
        <p className="text-sm mt-1" style={{ color: 'red' }}>
          {state.errors.model_name[0]}
        </p>
      )}
    </div>

    {/* Location */}
    <div>
      <label
        htmlFor="location"
        className="mb-1 block text-xs font-medium"
        style={{ color: '#000000' }}
      >
        Location
      </label>
      <select
        id="location"
        name="location"
        required
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="block w-full rounded-md border py-2 px-3 text-sm"
        style={{ backgroundColor: '#ffffff', borderColor: '#F8AFA6', color: '#000000' }}
      >
        <option value="" disabled>
          Selecciona un estado
        </option>
        {estadosMexico.map((estado) => (
          <option key={estado} value={estado}>
            {estado}
          </option>
        ))}
      </select>
      {state?.errors?.location?.[0] && (
        <p className="text-sm mt-1" style={{ color: 'red' }}>
          {state.errors.location[0]}
        </p>
      )}
    </div>

    {/* Nationality */}
    <div>
      <label
        htmlFor="nationality"
        className="mb-1 block text-xs font-medium"
        style={{ color: '#000000' }}
      >
        Nationality
      </label>
      <select
        id="nationality"
        name="nationality"
        required
        value={nationality}
        onChange={(e) => setNationality(e.target.value)}
        className="block w-full rounded-md border py-2 px-3 text-sm"
        style={{ backgroundColor: '#ffffff', borderColor: '#F8AFA6', color: '#000000' }}
      >
        <option value="" disabled>
          Selecciona una nacionalidad
        </option>
        {nacionalidades.map((nac) => (
          <option key={nac} value={nac}>
            {nac}
          </option>
        ))}
      </select>
      {state?.errors?.nationality?.[0] && (
        <p className="text-sm mt-1" style={{ color: 'red' }}>
          {state.errors.nationality[0]}
        </p>
      )}
    </div>

    {/* Age */}
    <div>
      <label
        htmlFor="age"
        className="mb-1 block text-xs font-medium"
        style={{ color: '#000000' }}
      >
        Age
      </label>
      <input
        id="age"
        name="age"
        type="number"
        min={18}
        max={80}
        value={age}
        placeholder="18"
        onChange={(e) => setAge(e.target.value)}
        className="block w-full rounded-md border py-2 px-3 text-sm"
        style={{ backgroundColor: '#ffffff', borderColor: '#F8AFA6', color: '#000000' }}
      />
      {state?.errors?.age?.[0] && (
        <p className="text-sm mt-1" style={{ color: 'red' }}>
          {state.errors.age[0]}
        </p>
      )}
    </div>

    {/* Pills Bust Size */}
    <div>
      <label className="mb-1 block text-xs font-medium" style={{ color: '#000000' }}>
        Bust Size
      </label>
      <div className="flex flex-wrap gap-2">
        {bustSizes.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => setBustSize(size)}
            className="px-3 py-1 rounded-full border text-xs"
            style={{
              backgroundColor: bustSize === size ? '#F8AFA6' : '#FADCD9',
              borderColor: bustSize === size ? '#F8AFA6' : '#FADCD9',
              color: '#000000',
            }}
          >
            {size}
          </button>
        ))}
      </div>
      <input type="hidden" name="bust_size" value={bustSize} />
      {state?.errors?.bust_size?.[0] && (
        <p className="text-sm mt-1" style={{ color: 'red' }}>
          {state.errors.bust_size[0]}
        </p>
      )}
    </div>

    {/* Pills Eye Color */}
    <div>
      <label className="mb-1 block text-xs font-medium" style={{ color: '#000000' }}>
        Eye Color
      </label>
      <div className="flex flex-wrap gap-2">
        {eyeColors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => setEyeColor(color)}
            className="px-3 py-1 rounded-full border text-xs"
            style={{
              backgroundColor: eyeColor === color ? '#F8AFA6' : '#FADCD9',
              borderColor: eyeColor === color ? '#F8AFA6' : '#FADCD9',
              color: '#000000',
            }}
          >
            {color}
          </button>
        ))}
      </div>
      <input type="hidden" name="eye_color" value={eyeColor} />
      {state?.errors?.eye_color?.[0] && (
        <p className="text-sm mt-1" style={{ color: 'red' }}>
          {state.errors.eye_color[0]}
        </p>
      )}
    </div>

    {/* Pills Hip Size */}
    <div>
      <label className="mb-1 block text-xs font-medium" style={{ color: '#000000' }}>
        Hip Size
      </label>
      <div className="flex flex-wrap gap-2">
        {hipSizes.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => setHipSize(size)}
            className="px-3 py-1 rounded-full border text-xs"
            style={{
              backgroundColor: hipSize === size ? '#F8AFA6' : '#FADCD9',
              borderColor: hipSize === size ? '#F8AFA6' : '#FADCD9',
              color: '#000000',
            }}
          >
            {size}
          </button>
        ))}
      </div>
      <input type="hidden" name="hip_size" value={hipSize} />
      {state?.errors?.hip_size?.[0] && (
        <p className="text-sm mt-1" style={{ color: 'red' }}>
          {state.errors.hip_size[0]}
        </p>
      )}
    </div>

    {/* Languages */}
    <div>
      <label className="mb-1 block text-xs font-medium" style={{ color: '#000000' }}>
        Languages
      </label>
      <div className="flex flex-wrap gap-2">
        {languagesList.map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => {
              setLanguage((prev) =>
                prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
              );
            }}
            className="px-3 py-1 rounded-full border text-xs"
            style={{
              backgroundColor: language.includes(lang) ? '#F8AFA6' : '#FADCD9',
              borderColor: language.includes(lang) ? '#F8AFA6' : '#FADCD9',
              color: '#000000',
            }}
          >
            {lang.charAt(0).toUpperCase() + lang.slice(1)}
          </button>
        ))}
      </div>
      <input type="hidden" name="language" value={language.join(', ')} />
      {state?.errors?.language?.[0] && (
        <p className="text-sm mt-1" style={{ color: 'red' }}>
          {state.errors.language[0]}
        </p>
      )}
    </div>

    {/* Weight, Height, Description */}
    <div className="flex gap-4">
      <div className="flex-1">
        <label
          className="mb-1 block text-xs font-medium"
          style={{ color: '#000000' }}
        >
          Weight (kg)
        </label>
        <input
          name="weight_kg"
          type="number"
          value={weightKg}
          onChange={(e) => setWeightKg(e.target.value)}
          className="block w-full rounded-md border py-2 px-3 text-base text-center transition"
          style={{ backgroundColor: '#ffffff', borderColor: '#F8AFA6', color: '#000000' }}
          placeholder="0"
        />
      </div>

      <div className="flex-1">
        <label
          className="mb-1 block text-xs font-medium"
          style={{ color: '#000000' }}
        >
          Height (cm)
        </label>
        <input
          name="height_cm"
          type="number"
          value={heightCm}
          onChange={(e) => setHeightCm(e.target.value)}
          className="block w-full rounded-md border py-2 px-3 text-base text-center transition"
          style={{ backgroundColor: '#ffffff', borderColor: '#F8AFA6', color: '#000000' }}
          placeholder="0"
        />
      </div>
    </div>

    <div>
      <label className="mb-1 block text-xs font-medium" style={{ color: '#000000' }}>
        Description
      </label>
      <textarea
        name="description"
        rows={3}
        value={description}
        onChange={(e) => {
          const text = e.target.value;
          const words = text.trim().split(/\s+/);
          if (words.length <= 50) {
            setDescription(text);
          } else {
            setDescription(words.slice(0, 50).join(' '));
          }
        }}
        className="block w-full rounded-md border py-2 px-3 text-sm"
        style={{ backgroundColor: '#ffffff', borderColor: '#F8AFA6', color: '#000000' }}
        placeholder="Max 50 palabras"
      />
      <p className="text-xs mt-1" style={{ color: '#000000' }}>
        {description.trim() === '' ? 0 : description.trim().split(/\s+/).length} / 50 palabras
      </p>
    </div>

    {/* Social Media */}
    <fieldset
      className="space-y-4 border-t pt-4"
      style={{ borderColor: '#F8AFA6' }}
    >
      <legend className="mb-2 text-sm font-semibold" style={{ color: '#000000' }}>
        Social Media
      </legend>
      {[
        { field: 'twitter', icon: <FaTwitter style={{ color: '#1DA1F2' }} /> },
        { field: 'instagram', icon: <FaInstagram style={{ color: '#E1306C' }} /> },
        { field: 'telegram', icon: <FaTelegramPlane style={{ color: '#0088cc' }} /> },
        { field: 'whatsapp', icon: <FaWhatsapp style={{ color: '#25D366' }} /> },
        { field: 'web', icon: <FaGlobe style={{ color: '#000000' }} /> },
      ].map(({ field, icon }) => (
        <div key={field}>
          <label
            className="mb-1 text-xs font-medium flex items-center gap-2 capitalize"
            style={{ color: '#000000' }}
          >
            {icon} {field}
          </label>
          <input
            name={field}
            type="text"
            value={(social as any)[field] || ''}
            onChange={(e) => updateSocialField(field as keyof Social, e.target.value)}
            className="block w-full rounded-md border py-2 px-3 text-sm"
            style={{ backgroundColor: '#ffffff', borderColor: '#F8AFA6', color: '#000000' }}
          />
        </div>
      ))}
    </fieldset>

    {state?.message && (
      <p className="text-sm mt-2" style={{ color: 'red' }}>
        {state.message}
      </p>
    )}

    <Button
      className="mt-6 w-full"
      style={{ backgroundColor: '#F8AFA6', color: '#000000' }}
      aria-disabled={isPending}
    >
      Save Changes <CheckIcon className="ml-auto h-5 w-5" style={{ color: '#000000' }} />
    </Button>
    </form>
  );
}
