export interface User {
  name: string;
}

export interface Image {
  id: string;
  url: string;
}

export interface Reply {
  id: string;
  creator: string;
  comment: string;
  createdAt: number;
}

export interface Thread {
  id: string;
  imageId: string;
  creator: string;
  x: number;
  y: number;
  comment: string;
  replies: Reply[];
}

export const users: User[] = [];
export const images: Image[] = [];
export const threads: Thread[] = [];
