export interface SubscribeRequest {
  email: string;
  numberPhone?: string;
  plan?: string;
  frequency?: number;
}

export interface SubscribeResponse {
  email?: string;
  numberPhone?: string;
  plan?: string;
  id?: string;
}

export interface UnsubscribeRequest {
  email: string;
}

export interface UnsubscribeResponse {
  status: string;
}

export interface DetailsRequest {
  email: string;
}

export interface DetailsResponse {
  status: string;
}
