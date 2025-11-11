export type Category = {
  id: string;
  nameEn: string;
  nameAr: string;
  icon: string;
  imageUrl?: string;
};

export type PricingTier = {
  name: "basic" | "standard" | "premium";
  price: number;
  deliveryDays: number;
  description: string;
  features: string[];
};

export type Freelancer = {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  ordersInQueue: number;
  languages: string[];
  skills: string[];
  memberSince: string;
  bio: string;
  verified: boolean;
};

export type Gig = {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  freelancerId: string;
  thumbnail: string;
  images: string[];
  pricing: PricingTier[];
  tags: string[];
  featured: boolean;
};

export const categories: Category[] = [
  {
    id: "1",
    nameEn: "Graphic Design",
    nameAr: "التصميم الجرافيكي",
    icon: "palette",
    imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=100&h=100&fit=crop",
  },
  {
    id: "2",
    nameEn: "Content Creation",
    nameAr: "إنشاء المحتوى",
    icon: "pen-tool",
    imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=100&h=100&fit=crop",
  },
  {
    id: "3",
    nameEn: "Translation",
    nameAr: "الترجمة",
    icon: "languages",
    imageUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=100&h=100&fit=crop",
  },
  {
    id: "4",
    nameEn: "Social Media",
    nameAr: "وسائل التواصل",
    icon: "share-2",
    imageUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=100&h=100&fit=crop",
  },
  {
    id: "5",
    nameEn: "Digital Marketing",
    nameAr: "التسويق الرقمي",
    icon: "trending-up",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&h=100&fit=crop",
  },
  {
    id: "6",
    nameEn: "Video Editing",
    nameAr: "تحرير الفيديو",
    icon: "video",
    imageUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=100&h=100&fit=crop",
  },
  {
    id: "7",
    nameEn: "Web Development",
    nameAr: "تطوير المواقع",
    icon: "code",
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=100&h=100&fit=crop",
  },
  {
    id: "8",
    nameEn: "Voice Over",
    nameAr: "التعليق الصوتي",
    icon: "mic",
    imageUrl: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=100&h=100&fit=crop",
  },
  {
    id: "9",
    nameEn: "Photography",
    nameAr: "التصوير الفوتوغرافي",
    icon: "camera",
    imageUrl: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=100&h=100&fit=crop",
  },
  {
    id: "10",
    nameEn: "Music & Audio",
    nameAr: "الموسيقى والصوت",
    icon: "music",
    imageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop",
  },
  {
    id: "11",
    nameEn: "Animation",
    nameAr: "الرسوم المتحركة",
    icon: "film",
    imageUrl: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=100&h=100&fit=crop",
  },
  {
    id: "12",
    nameEn: "Data Entry",
    nameAr: "إدخال البيانات",
    icon: "database",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop",
  },
  {
    id: "13",
    nameEn: "Virtual Assistant",
    nameAr: "المساعد الافتراضي",
    icon: "headphones",
    imageUrl: "https://images.unsplash.com/photo-1553775927-c5a1264c8e8d?w=100&h=100&fit=crop",
  },
  {
    id: "14",
    nameEn: "Mobile Apps",
    nameAr: "تطبيقات الجوال",
    icon: "smartphone",
    imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=100&h=100&fit=crop",
  },
  {
    id: "15",
    nameEn: "SEO Services",
    nameAr: "خدمات السيو",
    icon: "search",
    imageUrl: "https://images.unsplash.com/photo-1571677208715-0b5c07e9f511?w=100&h=100&fit=crop",
  },
  {
    id: "16",
    nameEn: "Consulting",
    nameAr: "الاستشارات",
    icon: "briefcase",
    imageUrl: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=100&h=100&fit=crop",
  },
  {
    id: "17",
    nameEn: "Legal Services",
    nameAr: "الخدمات القانونية",
    icon: "file-text",
    imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=100&h=100&fit=crop",
  },
  {
    id: "18",
    nameEn: "Accounting",
    nameAr: "المحاسبة",
    icon: "calculator",
    imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=100&h=100&fit=crop",
  },
  {
    id: "19",
    nameEn: "E-Commerce",
    nameAr: "التجارة الإلكترونية",
    icon: "shopping-cart",
    imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&h=100&fit=crop",
  },
  {
    id: "20",
    nameEn: "Others",
    nameAr: "أخرى",
    icon: "more-horizontal",
    imageUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=100&h=100&fit=crop",
  },
];

export const freelancers: Freelancer[] = [
  {
    id: "1",
    name: "Ahmed Hassan",
    avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=300&h=300&fit=crop",
    rating: 4.9,
    reviewCount: 287,
    ordersInQueue: 3,
    languages: ["Arabic", "English"],
    skills: ["Logo Design", "Brand Identity", "Illustration"],
    memberSince: "2022-03",
    bio: "Professional graphic designer with 8+ years of experience. Specialized in brand identity and modern Arabic typography.",
    verified: true,
  },
  {
    id: "2",
    name: "Layla Al-Mansouri",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop",
    rating: 5.0,
    reviewCount: 412,
    ordersInQueue: 5,
    languages: ["Arabic", "English", "French"],
    skills: ["Content Writing", "SEO", "Copywriting"],
    memberSince: "2021-07",
    bio: "Bilingual content creator specializing in Arabic and English content for MENA brands.",
    verified: true,
  },
  {
    id: "3",
    name: "Omar Khalil",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
    rating: 4.8,
    reviewCount: 156,
    ordersInQueue: 2,
    languages: ["Arabic", "English"],
    skills: ["Translation", "Localization", "Proofreading"],
    memberSince: "2023-01",
    bio: "Professional translator with expertise in technical and marketing content.",
    verified: false,
  },
  {
    id: "4",
    name: "Fatima Al-Sayed",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop",
    rating: 4.9,
    reviewCount: 329,
    ordersInQueue: 4,
    languages: ["Arabic", "English"],
    skills: ["Social Media Management", "Instagram Marketing", "Content Strategy"],
    memberSince: "2022-09",
    bio: "Social media strategist helping MENA businesses grow their online presence.",
    verified: true,
  },
];

export const gigs: Gig[] = [
  {
    id: "1",
    title: "I will design a modern Arabic logo for your brand",
    description: "Transform your brand with a stunning, culturally resonant logo designed specifically for the MENA market. I specialize in creating modern Arabic typography combined with contemporary design principles.\n\nWhat you'll get:\n• Original logo concepts\n• Multiple revisions\n• Source files (AI, EPS, SVG)\n• Social media kit\n• Brand guidelines\n\nPerfect for startups, small businesses, and entrepreneurs looking to establish a strong visual identity in the region.",
    categoryId: "1",
    freelancerId: "1",
    thumbnail: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop",
    ],
    pricing: [
      {
        name: "basic",
        price: 150,
        deliveryDays: 3,
        description: "Basic logo design",
        features: ["2 logo concepts", "2 revisions", "PNG & JPG files", "24-hour delivery"],
      },
      {
        name: "standard",
        price: 300,
        deliveryDays: 5,
        description: "Logo + brand identity",
        features: [
          "4 logo concepts",
          "4 revisions",
          "All file formats",
          "Social media kit",
          "48-hour delivery",
        ],
      },
      {
        name: "premium",
        price: 600,
        deliveryDays: 7,
        description: "Complete brand package",
        features: [
          "6 logo concepts",
          "Unlimited revisions",
          "All source files",
          "Full brand guidelines",
          "Business card design",
          "Priority support",
        ],
      },
    ],
    tags: ["logo", "arabic", "branding", "design", "identity"],
    featured: true,
  },
  {
    id: "2",
    title: "I will write engaging Arabic content for your website",
    description: "Need high-quality Arabic content that resonates with your audience? I create compelling, SEO-optimized content tailored for MENA markets.\n\nServices include:\n• Website copy\n• Blog posts\n• Product descriptions\n• Social media content\n• Email newsletters\n\nNative Arabic speaker with perfect command of Modern Standard Arabic and Gulf dialects.",
    categoryId: "2",
    freelancerId: "2",
    thumbnail: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop",
    ],
    pricing: [
      {
        name: "basic",
        price: 80,
        deliveryDays: 2,
        description: "500 words",
        features: ["SEO optimized", "1 revision", "48-hour delivery"],
      },
      {
        name: "standard",
        price: 150,
        deliveryDays: 3,
        description: "1000 words",
        features: ["SEO optimized", "2 revisions", "Keyword research", "24-hour delivery"],
      },
      {
        name: "premium",
        price: 280,
        deliveryDays: 5,
        description: "2000 words",
        features: [
          "Premium SEO",
          "Unlimited revisions",
          "Keyword research",
          "Meta descriptions",
          "Express delivery",
        ],
      },
    ],
    tags: ["content", "arabic", "writing", "seo", "copywriting"],
    featured: true,
  },
  {
    id: "3",
    title: "I will translate English to Arabic professionally",
    description: "Professional English-Arabic translation services for businesses, websites, and documents. Native Arabic speaker with 5+ years of experience.\n\nSpecializations:\n• Technical translation\n• Marketing copy\n• Legal documents\n• Website localization\n• App interfaces\n\nAccurate, culturally appropriate translations delivered on time.",
    categoryId: "3",
    freelancerId: "3",
    thumbnail: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&h=600&fit=crop",
    ],
    pricing: [
      {
        name: "basic",
        price: 50,
        deliveryDays: 2,
        description: "Up to 500 words",
        features: ["Professional translation", "1 revision", "PDF delivery"],
      },
      {
        name: "standard",
        price: 90,
        deliveryDays: 3,
        description: "Up to 1000 words",
        features: [
          "Professional translation",
          "2 revisions",
          "Proofreading",
          "Multiple formats",
        ],
      },
      {
        name: "premium",
        price: 160,
        deliveryDays: 5,
        description: "Up to 2000 words",
        features: [
          "Premium translation",
          "Unlimited revisions",
          "Cultural adaptation",
          "Certified translation",
          "Express delivery",
        ],
      },
    ],
    tags: ["translation", "arabic", "english", "localization"],
    featured: false,
  },
  {
    id: "4",
    title: "I will manage your Instagram for explosive growth",
    description: "Grow your Instagram presence in the MENA region with proven strategies that work. I'll handle everything from content creation to engagement.\n\nWhat's included:\n• Daily posts & stories\n• Content calendar\n• Hashtag strategy\n• Engagement with followers\n• Monthly analytics report\n\nSpecialized in MENA markets with deep understanding of regional trends.",
    categoryId: "4",
    freelancerId: "4",
    thumbnail: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&h=600&fit=crop",
    ],
    pricing: [
      {
        name: "basic",
        price: 250,
        deliveryDays: 7,
        description: "1 week management",
        features: ["5 posts", "Daily stories", "Basic engagement", "Weekly report"],
      },
      {
        name: "standard",
        price: 900,
        deliveryDays: 30,
        description: "1 month management",
        features: [
          "20 posts",
          "Daily stories",
          "Active engagement",
          "Hashtag research",
          "Bi-weekly reports",
        ],
      },
      {
        name: "premium",
        price: 2500,
        deliveryDays: 30,
        description: "Premium management",
        features: [
          "30 posts",
          "Multiple daily stories",
          "Full engagement",
          "Content strategy",
          "Influencer outreach",
          "Weekly calls",
        ],
      },
    ],
    tags: ["instagram", "social media", "marketing", "growth"],
    featured: true,
  },
];

export function getGigsByCategory(categoryId: string): Gig[] {
  return gigs.filter((gig) => gig.categoryId === categoryId);
}

export function getFreelancerById(id: string): Freelancer | undefined {
  return freelancers.find((f) => f.id === id);
}

export function getGigById(id: string): Gig | undefined {
  return gigs.find((g) => g.id === id);
}

export function getFeaturedGigs(): Gig[] {
  return gigs.filter((gig) => gig.featured);
}

export function searchGigs(query: string): Gig[] {
  const lowerQuery = query.toLowerCase();
  return gigs.filter(
    (gig) =>
      gig.title.toLowerCase().includes(lowerQuery) ||
      gig.description.toLowerCase().includes(lowerQuery) ||
      gig.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

export type Message = {
  id: string;
  text: string;
  timestamp: string;
  senderId: string;
  isRead: boolean;
};

export type Conversation = {
  id: string;
  freelancerId: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  messages: Message[];
};

export type Revision = {
  id: string;
  requestDate: string;
  reason: string;
  status: "pending" | "in_progress" | "completed";
  response?: string;
  completedDate?: string;
};

export type Order = {
  id: string;
  gigId: string;
  freelancerId: string;
  packageType: "basic" | "standard" | "premium";
  price: number;
  status: "active" | "delivered" | "completed" | "cancelled" | "revision_requested";
  orderDate: string;
  dueDate: string;
  description: string;
  revisions?: Revision[];
  revisionsAllowed: number;
  revisionsUsed: number;
};

export const conversations: Conversation[] = [
  {
    id: "1",
    freelancerId: "1",
    lastMessage: "I'll start working on your logo concepts today",
    lastMessageTime: "2024-01-15T10:30:00Z",
    unreadCount: 2,
    isOnline: true,
    messages: [
      {
        id: "m1",
        text: "Hi! I'm interested in your logo design service",
        timestamp: "2024-01-15T09:00:00Z",
        senderId: "me",
        isRead: true,
      },
      {
        id: "m2",
        text: "Hello! Thank you for reaching out. I'd be happy to help with your logo design. Do you have any specific ideas or preferences?",
        timestamp: "2024-01-15T09:15:00Z",
        senderId: "1",
        isRead: true,
      },
      {
        id: "m3",
        text: "Yes, I need something modern with Arabic typography",
        timestamp: "2024-01-15T09:20:00Z",
        senderId: "me",
        isRead: true,
      },
      {
        id: "m4",
        text: "Perfect! That's my specialty. I'll start working on your logo concepts today",
        timestamp: "2024-01-15T10:30:00Z",
        senderId: "1",
        isRead: false,
      },
    ],
  },
  {
    id: "2",
    freelancerId: "2",
    lastMessage: "I can deliver the content by Wednesday",
    lastMessageTime: "2024-01-14T16:45:00Z",
    unreadCount: 0,
    isOnline: false,
    messages: [
      {
        id: "m5",
        text: "Can you write content for my website?",
        timestamp: "2024-01-14T15:00:00Z",
        senderId: "me",
        isRead: true,
      },
      {
        id: "m6",
        text: "Of course! How many words do you need?",
        timestamp: "2024-01-14T15:30:00Z",
        senderId: "2",
        isRead: true,
      },
      {
        id: "m7",
        text: "About 1000 words for the homepage",
        timestamp: "2024-01-14T16:00:00Z",
        senderId: "me",
        isRead: true,
      },
      {
        id: "m8",
        text: "I can deliver the content by Wednesday",
        timestamp: "2024-01-14T16:45:00Z",
        senderId: "2",
        isRead: true,
      },
    ],
  },
  {
    id: "3",
    freelancerId: "4",
    lastMessage: "Let's schedule a call to discuss the strategy",
    lastMessageTime: "2024-01-13T14:20:00Z",
    unreadCount: 1,
    isOnline: true,
    messages: [
      {
        id: "m9",
        text: "I need help growing my Instagram account",
        timestamp: "2024-01-13T13:00:00Z",
        senderId: "me",
        isRead: true,
      },
      {
        id: "m10",
        text: "I'd love to help! What's your current follower count?",
        timestamp: "2024-01-13T13:30:00Z",
        senderId: "4",
        isRead: true,
      },
      {
        id: "m11",
        text: "Around 2000 followers, but engagement is low",
        timestamp: "2024-01-13T14:00:00Z",
        senderId: "me",
        isRead: true,
      },
      {
        id: "m12",
        text: "Let's schedule a call to discuss the strategy",
        timestamp: "2024-01-13T14:20:00Z",
        senderId: "4",
        isRead: false,
      },
    ],
  },
];

export const orders: Order[] = [
  {
    id: "ord1",
    gigId: "1",
    freelancerId: "1",
    packageType: "standard",
    price: 1125,
    status: "active",
    orderDate: "2024-01-15T12:00:00Z",
    dueDate: "2024-01-20T12:00:00Z",
    description: "Logo + brand identity package for tech startup",
    revisionsAllowed: 4,
    revisionsUsed: 0,
    revisions: [],
  },
  {
    id: "ord2",
    gigId: "2",
    freelancerId: "2",
    packageType: "basic",
    price: 300,
    status: "delivered",
    orderDate: "2024-01-10T09:00:00Z",
    dueDate: "2024-01-12T09:00:00Z",
    description: "500 words Arabic content for homepage",
    revisionsAllowed: 2,
    revisionsUsed: 0,
    revisions: [],
  },
  {
    id: "ord3",
    gigId: "4",
    freelancerId: "4",
    packageType: "premium",
    price: 9375,
    status: "active",
    orderDate: "2024-01-05T10:00:00Z",
    dueDate: "2024-02-05T10:00:00Z",
    description: "Premium Instagram management - 1 month",
    revisionsAllowed: -1,
    revisionsUsed: 2,
    revisions: [
      {
        id: "rev1",
        requestDate: "2024-01-10T14:00:00Z",
        reason: "Please adjust the color scheme to be more vibrant",
        status: "completed",
        response: "Done! I've updated the color palette.",
        completedDate: "2024-01-11T10:00:00Z",
      },
      {
        id: "rev2",
        requestDate: "2024-01-13T16:00:00Z",
        reason: "Can you use different fonts for the headers?",
        status: "completed",
        response: "Updated with new font choices.",
        completedDate: "2024-01-14T09:00:00Z",
      },
    ],
  },
  {
    id: "ord4",
    gigId: "3",
    freelancerId: "3",
    packageType: "standard",
    price: 337.5,
    status: "completed",
    orderDate: "2024-01-01T08:00:00Z",
    dueDate: "2024-01-04T08:00:00Z",
    description: "Translation of marketing materials",
    revisionsAllowed: 2,
    revisionsUsed: 1,
    revisions: [
      {
        id: "rev3",
        requestDate: "2024-01-03T12:00:00Z",
        reason: "Please adjust the tone to be more formal",
        status: "completed",
        response: "I've revised the translation with a more formal tone.",
        completedDate: "2024-01-03T18:00:00Z",
      },
    ],
  },
  {
    id: "ord5",
    gigId: "1",
    freelancerId: "1",
    packageType: "basic",
    price: 562.5,
    status: "cancelled",
    orderDate: "2023-12-20T10:00:00Z",
    dueDate: "2023-12-23T10:00:00Z",
    description: "Basic logo design - cancelled due to timeline",
    revisionsAllowed: 2,
    revisionsUsed: 0,
    revisions: [],
  },
];

export function getConversationById(id: string): Conversation | undefined {
  return conversations.find((c) => c.id === id);
}

export function getOrderById(id: string): Order | undefined {
  return orders.find((o) => o.id === id);
}

export function getActiveOrders(): Order[] {
  return orders.filter((o) => o.status === "active" || o.status === "delivered");
}

export function getCancelledOrders(): Order[] {
  return orders.filter((o) => o.status === "cancelled");
}

export function getCompletedOrders(): Order[] {
  return orders.filter((o) => o.status === "completed");
}

export type SellerConversation = {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  messages: Message[];
};

export const sellerConversations: SellerConversation[] = [
  {
    id: "sc1",
    buyerId: "b1",
    buyerName: "Mohammed Ali",
    buyerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop",
    lastMessage: "Can you help with my branding project?",
    lastMessageTime: "2024-01-15T14:30:00Z",
    unreadCount: 2,
    isOnline: true,
    messages: [
      {
        id: "sm1",
        text: "Hi! I saw your logo design service",
        timestamp: "2024-01-15T13:00:00Z",
        senderId: "b1",
        isRead: true,
      },
      {
        id: "sm2",
        text: "Hello! Thanks for reaching out. I'd be happy to help with your logo design.",
        timestamp: "2024-01-15T13:15:00Z",
        senderId: "seller",
        isRead: true,
      },
      {
        id: "sm3",
        text: "Can you help with my branding project?",
        timestamp: "2024-01-15T14:30:00Z",
        senderId: "b1",
        isRead: false,
      },
    ],
  },
  {
    id: "sc2",
    buyerId: "b2",
    buyerName: "Sara Ahmed",
    buyerAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop",
    lastMessage: "Perfect! I'll wait for your offer",
    lastMessageTime: "2024-01-14T11:20:00Z",
    unreadCount: 0,
    isOnline: false,
    messages: [
      {
        id: "sm4",
        text: "I need a complete brand identity package",
        timestamp: "2024-01-14T10:00:00Z",
        senderId: "b2",
        isRead: true,
      },
      {
        id: "sm5",
        text: "Great! Let me prepare a custom offer for you.",
        timestamp: "2024-01-14T10:30:00Z",
        senderId: "seller",
        isRead: true,
      },
      {
        id: "sm6",
        text: "Perfect! I'll wait for your offer",
        timestamp: "2024-01-14T11:20:00Z",
        senderId: "b2",
        isRead: true,
      },
    ],
  },
  {
    id: "sc3",
    buyerId: "b3",
    buyerName: "Khalid Hassan",
    buyerAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop",
    lastMessage: "When can you start?",
    lastMessageTime: "2024-01-13T16:45:00Z",
    unreadCount: 1,
    isOnline: true,
    messages: [
      {
        id: "sm7",
        text: "I need urgent logo updates",
        timestamp: "2024-01-13T16:00:00Z",
        senderId: "b3",
        isRead: true,
      },
      {
        id: "sm8",
        text: "I can help! It usually takes 2 days for quick updates.",
        timestamp: "2024-01-13T16:30:00Z",
        senderId: "seller",
        isRead: true,
      },
      {
        id: "sm9",
        text: "When can you start?",
        timestamp: "2024-01-13T16:45:00Z",
        senderId: "b3",
        isRead: false,
      },
    ],
  },
];

export function getSellerConversationById(id: string): SellerConversation | undefined {
  return sellerConversations.find((c) => c.id === id);
}
