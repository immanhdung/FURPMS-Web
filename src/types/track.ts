export interface Track {
  id: number;
  name: string;
  description?: string | null;
  ownerId?: string | null;
  isActive: boolean;
}

export interface CreateTrackPayload {
  name: string;
  description?: string;
  ownerId?: string;
}

export interface UpdateTrackPayload {
  name?: string;
  description?: string;
}
