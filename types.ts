
export enum TransportType {
  CAR = 'CAR',
  TRAIN = 'TRAIN',
  FLIGHT = 'FLIGHT',
  RIDESHARE = 'RIDESHARE',
  BUS = 'BUS',
  TRANSIT = 'TRANSIT',
  BIKE = 'BIKE'
}

export enum TripScope {
  LOCAL = 'LOCAL',
  LONG_DISTANCE = 'LONG_DISTANCE'
}

export interface CostBreakdownItem {
  label: string;
  amount: number;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface RouteOption {
  id: string;
  type: TransportType;
  durationMinutes: number;
  totalCost: number;
  currency: string;
  costBreakdown: CostBreakdownItem[];
  bookingUrl?: string;
  recommendationType?: 'FASTEST' | 'CHEAPEST' | 'BEST_VALUE';
  recommendationReason?: string;
  groundingSources?: GroundingSource[];
}

export interface TripInput {
  origin: string;
  destination: string;
  date: string;
  time: string;
  travelers: number;
  scope: TripScope;
  currency: string;
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$'
};

// Database Types
export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  default_currency: string;
}

export interface SavedRoute {
  id: string;
  user_id: string;
  origin: string;
  destination: string;
  transport_type: TransportType;
  duration_minutes: number;
  total_cost: number;
  currency: string;
  cost_breakdown: CostBreakdownItem[];
  booking_url?: string;
  notes?: string;
  created_at: string;
}

export interface SearchHistory {
  id: string;
  user_id: string;
  origin: string;
  destination: string;
  date: string;
  time: string;
  travelers: number;
  scope: TripScope;
  currency: string;
  created_at: string;
}
