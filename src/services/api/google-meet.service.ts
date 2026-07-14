import { axiosClient } from "@/services/api/axiosClient";
import type { ApiResponse } from "@/types/common";

interface GoogleMeetLink {
  meetingLink: string;
}

export const googleMeetService = {
  generateLink: () =>
    axiosClient
      .post<ApiResponse<GoogleMeetLink>>("/integrations/google-meet/generate")
      .then((res) => res.data.data),
};
