export interface Attachment {
  id: string;
  avvId: string;
  name: string;
  type: string;
  size: number;
  data: string; // Base64
  createdAt: string;
  updatedAt: string;
} 