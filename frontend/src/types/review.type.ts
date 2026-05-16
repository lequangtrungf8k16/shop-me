export interface Review {
   id: number;
   rating: number;
   content: string | null;
   createdAt: string;
   user: { id: number; fullName: string };
}

export interface ReviewStats {
   averageRating: string;
   totalReviews: number;
   distribution: { star: number; count: number; percent: number }[];
}

export interface ReviewsApiResponse {
   reviews: Review[];
   pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
   };
   stats: ReviewStats;
}
