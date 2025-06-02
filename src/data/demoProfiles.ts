
export const demoProfiles = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001", // Using UUID format instead of 1
    name: "Emma",
    age: 24,
    image: "/lovable-uploads/a47c94f5-4caa-440f-a3a5-96cf72617433.png",
    bio: "Love hiking and coffee ☕️",
    whatsapp: "+27123456789",
    location: "Cape Town",
    gender: "female" as const,
    posts: ["/lovable-uploads/b13cab85-67d6-4d3c-8114-0653acecba3f.png"]
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002", // Using UUID format instead of 2
    name: "Sarah",
    age: 26,
    image: "/lovable-uploads/edfa4e3e-1870-4ac8-8dda-4b518536741c.png",
    bio: "Artist and dreamer 🎨",
    whatsapp: "+27123456790",
    location: "Johannesburg",
    gender: "female" as const,
    posts: ["/lovable-uploads/ff0b1c28-2b37-4b20-b7c0-589627c4b494.png"]
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003", // Using UUID format instead of 3
    name: "Mike",
    age: 28,
    image: "/lovable-uploads/a5eeb907-4974-443e-8d49-33ec325223c7.png",
    bio: "Fitness enthusiast 💪",
    whatsapp: "+27123456791",
    location: "Durban",
    gender: "male" as const,
    userType: "service_provider" as const,
    serviceCategory: "Personal Trainer",
    services: ["Weight Training", "Cardio", "Nutrition"],
    rating: 4.8,
    reviewCount: 156,
    isAvailable: true,
    portfolio: [
      "/lovable-uploads/06107441-afdf-4e5a-a284-daf50c0d3816.png",
      "/lovable-uploads/fd167397-4f70-4b29-92c9-10c373970912.png"
    ]
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004", // Using UUID format instead of 4
    name: "Jessica",
    age: 23,
    image: "/lovable-uploads/a47c94f5-4caa-440f-a3a5-96cf72617433.png",
    bio: "Yoga instructor and wellness coach 🧘‍♀️",
    whatsapp: "+27123456792",
    location: "Cape Town",
    gender: "female" as const
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005", // Using UUID format instead of 5
    name: "David",
    age: 30,
    image: "/lovable-uploads/a5eeb907-4974-443e-8d49-33ec325223c7.png",
    bio: "Tech entrepreneur and travel lover ✈️",
    whatsapp: "+27123456793",
    location: "Johannesburg",
    gender: "male" as const,
    posts: ["/lovable-uploads/b13cab85-67d6-4d3c-8114-0653acecba3f.png"]
  }
];
