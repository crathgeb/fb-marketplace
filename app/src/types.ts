export interface Listing {
  name: string;
  approved: boolean;
  images: string[];
  videos: string[];
}

export interface ListingContent {
  title: string;
  price: string;
  description: string;
}
