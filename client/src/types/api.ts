export interface Direction {
  id: string;
  name: string;
  slug: string;
  orderNum: number;
  programs: ProgramSummary[];
}

export interface ProgramSummary {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  tags: string[];
  shortDesc: string | null;
  duration: string | null;
  format: string | null;
  level: string | null;
  startDate: string | null;
  orderNum?: number;
}

export interface Testimonial {
  text: string;
  author: string;
  role?: string;
}

export interface Instructor {
  name: string;
  role: string;
  bio: string;
}

export interface ProgramDetail extends ProgramSummary {
  direction: { name: string; slug: string };
  targetAudience: string[];
  outcomes: string[];
  structure: { title: string; content: string }[];
  level: string | null;
  startDate: string | null;
  howItWorks: string | null;
  testimonials: Testimonial[];
  instructors: Instructor[];
  faq: { q: string; a: string }[];
  packages: Package[];
}

export interface Package {
  id: string;
  name: string;
  price: number;
  features: string[];
  recommended: boolean;
  orderNum: number;
}

export interface CatalogResponse {
  directions: Direction[];
}

export interface LeadPayload {
  programId: string;
  programName: string;
  direction?: string;
  selectedPackage?: string;
  priceShown?: number;
  clientName?: string;
  email?: string;
  phone?: string;
  telegramUserId?: string;
  telegramUsername?: string;
  telegramFirstName?: string;
  telegramLastName?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  answers?: { goal?: string; level?: string; schedule?: string; comment?: string };
  device?: { platform?: string; userAgent?: string; language?: string; theme?: string };
  website?: string; // honeypot
  initDataSubset?: Record<string, unknown>;
}

export interface Lead {
  id: string;
  programId: string;
  programName: string;
  direction: string | null;
  selectedPackage: string | null;
  priceShown: number | null;
  status: string;
  clientName: string | null;
  email: string | null;
  phone: string | null;
  telegramUserId: string | null;
  telegramUsername: string | null;
  telegramFirstName: string | null;
  telegramLastName: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  answers: string | null;
  device: string | null;
  createdAt: string;
  updatedAt: string;
}
