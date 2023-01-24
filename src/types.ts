export interface Subscribe_Request {
  email: string;
  numberPhone?: string;
  plan?: string;
  frequency?: number;
}

export interface Subscribe_Response {
  email?: string;
  numberPhone?: string;
  plan?: string;
  id?: string;
}

export interface Unsubscribe_Request {
  email: string;
}

export interface Unsubscribe_Response {
  status: string;
}

export interface Details_Request {
  email: string;
}

export interface Details_Response {
  status: string;
}
