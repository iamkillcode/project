export type Place = {
  name: string;
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  place_id: string;
  types: string[];
  photos?: Array<{
    photo_reference: string;
  }>;
}

export type GooglePlacesResponse = {
  results: Place[];
  status: string;
  next_page_token?: string;
}

export type PlaceDetails = {
  result?: {
    website?: string;
    formatted_phone_number?: string;
  };
  status: string;
}
