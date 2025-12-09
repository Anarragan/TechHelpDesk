export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: {
    id: number;
    name: string;
  };
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  updatedAt: string;
  client: {
    id: number;
    name: string;
  };
  technician?: {
    id: number;
    name: string;
  };
  category: {
    id: number;
    name: string;
  };
  createdBy: {
    id: number;
    username: string;
  };
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
