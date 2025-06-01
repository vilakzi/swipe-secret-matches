
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
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=600&fit=crop&crop=face",
    bio: "Johannesburg vibes ✨ Looking for genuine connections",
    whatsapp: "+27123456780",
    location: "Johannesburg, Gauteng",
    gender: 'female' as const,
    userType: 'user' as const,
    posts: [
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=800&fit=crop", 
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&h=800&fit=crop"
    ]
  },
  {
    id: 2,
    name: "Thandi",
    age: 25,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=600&fit=crop&crop=face",
    bio: "Pretoria princess 👑 Adventure seeker and night owl",
    whatsapp: "+27123456781",
    location: "Pretoria, Gauteng",
    gender: 'female' as const,
    userType: 'user' as const,
    posts: ["https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&h=800&fit=crop"]
  },
  {
    id: 3,
    name: "Zinhle",
    age: 24,
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop&crop=face",
    bio: "Sandton girl with big dreams 💫 Free spirit, good vibes only",
    whatsapp: "+27123456782",
    location: "Sandton, Gauteng",
    gender: 'female' as const,
    userType: 'user' as const,
    posts: [
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&h=800&fit=crop"
    ]
  },
  {
    id: 4,
    name: "Naledi",
    age: 22,
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=600&fit=crop&crop=face",
    bio: "Vosloorus born and raised 🌟 Spontaneous and fun",
    whatsapp: "+27123456783",
    location: "Vosloorus, Gauteng",
    gender: 'female' as const,
    userType: 'user' as const,
    posts: ["https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=800&fit=crop"]
  },
  {
    id: 5,
    name: "Lerato",
    age: 26,
    image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400&h=600&fit=crop&crop=face",
    bio: "Secunda sweetheart ✨ Life's too short for boring conversations",
    whatsapp: "+27123456785",
    location: "Secunda, Mpumalanga",
    gender: 'female' as const,
    userType: 'user' as const,
    posts: [
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=800&fit=crop"
    ]
  },
  {
    id: 6,
    name: "Khanyi",
    age: 24,
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=600&fit=crop&crop=face",
    bio: "Johannesburg beauty 🌹 Confident and ready for new adventures",
    whatsapp: "+27123456786",
    location: "Johannesburg, Gauteng",
    gender: 'female' as const,
    userType: 'user' as const,
    posts: ["https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=800&fit=crop"]
  },
  {
    id: 7,
    name: "Mbali",
    age: 25,
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop&crop=face",
    bio: "Pretoria fashionista ⚡ Looking for real connections, no games",
    whatsapp: "+27123456787",
    location: "Pretoria, Gauteng",
    gender: 'female' as const,
    userType: 'user' as const,
    posts: ["https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&h=800&fit=crop"]
  },
  {
    id: 8,
    name: "Sibongile",
    age: 23,
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=600&fit=crop&crop=face",
    bio: "Sandton socialite 🌶️ Sweet but spicy, let's vibe together",
    whatsapp: "+27123456788",
    location: "Sandton, Gauteng",
    gender: 'female' as const,
    userType: 'user' as const,
    posts: [
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&h=800&fit=crop"
    ]
  }
];
