import { Review } from "./review";

export interface LongLocation {
  _id: string;
  name: string;
  address: string;
  locality: string;
  region: String,
  country: string;
  fsq_id: String,
  image: string;
  locationCoords: coords;
  ownCoords: coords;
  date: string;
  reviews: Review[];
}
export interface coords{
  coordinates: number[];
}
