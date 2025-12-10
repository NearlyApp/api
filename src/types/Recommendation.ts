export type Recommendation = {
  post_id: string;
  metadata: {
    location: Location;
  };
  status: RecommendationStatus;
  text: string;
  created_at: string;
  updated_at: string;
};

export type Location = {
  lat: number;
  lon: number;
};

export type RecommendationStatus =
  | 'WAITING_FOR_PROCESSING'
  | 'PROCESSING'
  | 'PROCESSED'
  | 'FAILED'
  | undefined;
