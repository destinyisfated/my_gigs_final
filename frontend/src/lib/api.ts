// ============================================
// API Configuration and Utility Functions
// ============================================
// This file contains all API endpoint configurations and fetch utilities
// for communicating with your Django REST Framework backend

// Base API URL - Update this to your Django backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// ============================================
// Generic API Utility Functions
// ============================================

/**
 * Generic fetch wrapper with error handling
 * @param endpoint - API endpoint (e.g., '/freelancers/')
 * @param options - Fetch options (method, headers, body, etc.)
 */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Add default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // If you need authentication, add token to headers:   3 lines uncommented
  const token = localStorage.getItem('authToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error;
  }
}



export interface Freelancer {
  id: number;
  name: string;
  title: string;
  county: string;           // Foreign key to County model
  constituency: string;     // Foreign key to Constituency model
  ward: string;            // Foreign key to Ward model
  rating: number;
  reviews: number;
  completed_jobs: number;
  skills: string[];        // JSONField or ManyToMany relationship
  avatar: string;          // Could be avatar initials or image URL
  years_experience: number;
  hourly_rate: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}


export const fetchFreelancersByProfession = async (
  professionId: number,
  filters: {
    county?: string;
    constituency?: string;
    ward?: string;
    min_rating?: number;
    min_experience?: number;
    search?: string;
    page?: number;
    page_size?: number;
  }
): Promise<{ results: Freelancer[]; count: number }> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });
  
  const response = await fetch(
    `${API_BASE_URL}/professions/${professionId}/freelancers/?${params}`
  );
  if (!response.ok) throw new Error('Failed to fetch freelancers');
  return response.json();
};

export async function fetchFeaturedFreelancers(): Promise<Freelancer[]> {
  // Django endpoint: /api/freelancers/?is_featured=true&page_size=4
  return apiFetch<Freelancer[]>('/freelancers/?is_featured=true&page_size=4');
}

export async function fetchFreelancerById(id: number): Promise<Freelancer> {
  // Django endpoint: /api/freelancers/{id}/
  return apiFetch<Freelancer>(`/freelancers/${id}/`);
}


export interface Profession {
  id: number;
  name: string;
  image_url: string;       // ImageField - Django will serve from MEDIA_URL
  count: number;           // Computed field - count of freelancers with this profession
  description: string;
}


export const fetchProfessions = async (): Promise<Profession[]> => {
  const response = await fetch(`${API_BASE_URL}/professions/`);
  if (!response.ok) throw new Error('Failed to fetch professions');
  return response.json();
};

// --------------------------------------------
// Reviews API
// --------------------------------------------
// Django Model: Review

export interface Review {
  id: string;
  freelancer_id: number;   // Foreign key to Freelancer
  client_name: string;
  client_avatar: string;
  rating: number;
  content: string;
  helpful_count: number;
  created_at: string;
  reply?: {
    content: string;
    created_at: string;
  };
}

export async function fetchReviewsByFreelancer(freelancerId: number): Promise<Review[]> {
  // Django endpoint: /api/freelancers/{freelancer_id}/reviews/
  return apiFetch<Review[]>(`/freelancers/${freelancerId}/reviews/`);
}

export async function createReview(freelancerId: number, data: any, token?: string) {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/freelancers/${freelancerId}/reviews/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    console.error("BACKEND ERROR:", errBody);
    throw new Error(errBody?.detail || "Failed to create review");
  }

  return res.json();
}

export async function markReviewHelpful(reviewId: number, token?: string) {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/reviews/${reviewId}/mark_helpful/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
  const data = await res.json();

  if (!res.ok) {
      throw new Error(data.detail || "Already marked as helpful");

  }

  return data;
}

// ADD REVIEW REPLY
export async function addReviewReply(
  reviewId: number,
  content: string,
  token?: string
) {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/reviews/${reviewId}/add_reply/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ content }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Failed to add reply");
  }

  return res.json();
}



export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;            // Full-time, Part-time, Contract
  budget: string;
  skills: string[];
  posted: string;
  is_featured: boolean;
  created_at: string;
}



export async function fetchJobs(params: {
  is_featured?: boolean;
  page?: number;
  page_size?: number;
}): Promise<{ results: Job[]; count: number }> {
  const queryParams = new URLSearchParams();
  
  if (params.is_featured !== undefined) {
    queryParams.append('is_featured', params.is_featured.toString());
  }
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.page_size) queryParams.append('page_size', params.page_size.toString());

  return apiFetch<{ results: Job[]; count: number }>(`/jobs/?${queryParams.toString()}`);
}

export async function fetchFeaturedJobs(): Promise<Job[]> {
  // Django endpoint: /api/jobs/?is_featured=true&page_size=4
  return apiFetch<Job[]>('/jobs/?is_featured=true&page_size=4');
}



export interface Testimonial {
  id: number;
  name: string;
  content: string;
  rating: number;
  avatar: string;
  created_at: string;
}


// GET approved testimonials (public)
export async function fetchTestimonials(): Promise<Testimonial[]> {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/testimonials/`);

  if (!res.ok) {
    throw new Error("Failed to fetch testimonials");
  }

  return res.json();
}



const handleSubmitTestimonial = async (testimonialData: {
  name: string;
  content: string;
  rating: number;
  avatar: string;
}) => {
 
};
// POST testimonial (AUTH REQUIRED)
export async function createTestimonial(
  data: { rating: number; content: string },
  token: string
) {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/testimonials/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ REQUIRED
      },
      body: JSON.stringify(data),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Failed to submit testimonial");
  }

  return res.json();
}







export interface County {
  name: string;
  code: number;
  capital?: string;
}

export interface Constituency {
  name: string;
}

export interface Ward {
  name: string;
}



export async function fetchCounties(): Promise<County[]> {
  // Django endpoint: /api/counties/
  return apiFetch<County[]>('/counties/');
}

export async function fetchConstituencies(countyCode: number): Promise<Constituency[]> {
  // Django endpoint: /api/constituencies/?county_code={countyCode}
  return apiFetch<Constituency[]>(`/constituencies/?county_code=${countyCode}`);
}

export async function fetchWards(constituencyId: number): Promise<Ward[]> {
  // Django endpoint: /api/wards/?constituency_id={constituencyId}
  return apiFetch<Ward[]>(`/wards/?constituency_id=${constituencyId}`);
}

