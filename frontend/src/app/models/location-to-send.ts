import { Review } from "./review";

export interface LocationToSend {
    name: string;
    address: string;
    locality: string;
    region: String,
    country: string;
    fsq_id: String,
    image: string;
    Otherlng: number;
    Otherlat: number;
    Ownlng: number;
    Ownlat: number;
    date: string;
    reviews: Review[];
}
