
export interface Profile {
  id: number;
  name: string;
  age: number;
  image: string;
  bio: string;
  whatsapp: string;
  location: string;
  gender: 'male' | 'female';
  userType: 'user' | 'service_provider';
  posts: string[];
}

export const demoProfiles: Profile[] = [
  {
    id: 1,
    name: "Nomsa",
    age: 23,
    image: "/lovable-uploads/b13cab85-67d6-4d3c-8114-0653acecba3f.png",
    bio: "Johannesburg vibes ✨ Looking for genuine connections",
    whatsapp: "+27123456780",
    location: "Johannesburg, Gauteng",
    gender: 'female' as const,
    userType: 'user' as const,
    posts: []
  },
  {
    id: 2,
    name: "Thandi",
    age: 25,
    image: "/lovable-uploads/a47c94f5-4caa-440f-a3a5-96cf72617433.png",
    bio: "Pretoria princess 👑 Adventure seeker and night owl",
    whatsapp: "+27123456781",
    location: "Pretoria, Gauteng",
    gender: 'female' as const,
    userType: 'user' as const,
    posts: []
  },
  {
    id: 3,
    name: "Zinhle",
    age: 24,
    image: "/lovable-uploads/06107441-afdf-4e5a-a284-daf50c0d3816.png",
    bio: "Sandton girl with big dreams 💫 Free spirit, good vibes only",
    whatsapp: "+27123456782",
    location: "Sandton, Gauteng",
    gender: 'female' as const,
    userType: 'user' as const,
    posts: []
  },
  {
    id: 4,
    name: "Naledi",
    age: 22,
    image: "/lovable-uploads/fd167397-4f70-4b29-92c9-10c373970912.png",
    bio: "Vosloorus born and raised 🌟 Spontaneous and fun",
    whatsapp: "+27123456783",
    location: "Vosloorus, Gauteng",
    gender: 'female' as const,
    userType: 'user' as const,
    posts: []
  },
  {
    id: 5,
    name: "Lerato",
    age: 26,
    image: "/lovable-uploads/a5eeb907-4974-443e-8d49-33ec325223c7.png",
    bio: "Secunda sweetheart ✨ Life's too short for boring conversations",
    whatsapp: "+27123456785",
    location: "Secunda, Mpumalanga",
    gender: 'female' as const,
    userType: 'user' as const,
    posts: []
  },
  {
    id: 6,
    name: "Khanyi",
    age: 24,
    image: "/lovable-uploads/ff0b1c28-2b37-4b20-b7c0-589627c4b494.png",
    bio: "Johannesburg beauty 🌹 Confident and ready for new adventures",
    whatsapp: "+27123456786",
    location: "Johannesburg, Gauteng",
    gender: 'female' as const,
    userType: 'user' as const,
    posts: []
  },
  {
    id: 7,
    name: "Mbali",
    age: 25,
    image: "/lovable-uploads/edfa4e3e-1870-4ac8-8dda-4b518536741c.png",
    bio: "Pretoria fashionista ⚡ Looking for real connections, no games",
    whatsapp: "+27123456787",
    location: "Pretoria, Gauteng",
    gender: 'female' as const,
    userType: 'user' as const,
    posts: []
  }
];
