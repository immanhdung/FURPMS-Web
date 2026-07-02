import { delay, http, HttpResponse } from "msw";
import { API_BASE_URL } from "@/constants/env";
import { getNextResearchTypeId, researchTypesStore } from "@/mock/data/research-types";
import type { ApiResponse } from "@/types/common";
import type { CreateResearchTypePayload, ResearchType, UpdateResearchTypePayload } from "@/types/research-type";

export const researchTypeHandlers = [
  http.get(`${API_BASE_URL}/cycles/research-types`, async ({ request }) => {
    await delay(250);
    const includeInactive = new URL(request.url).searchParams.get("includeInactive") === "true";
    const data = includeInactive ? researchTypesStore : researchTypesStore.filter((rt) => rt.isActive);
    const response: ApiResponse<ResearchType[]> = { success: true, data };
    return HttpResponse.json(response);
  }),

  http.post(`${API_BASE_URL}/cycles/research-types`, async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as CreateResearchTypePayload;
    const created: ResearchType = { id: getNextResearchTypeId(), isActive: true, ...body };
    researchTypesStore.push(created);
    const response: ApiResponse<ResearchType> = { success: true, data: created };
    return HttpResponse.json(response);
  }),

  http.put(`${API_BASE_URL}/cycles/research-types/:id`, async ({ request, params }) => {
    await delay(300);
    const id = Number(params.id);
    const body = (await request.json()) as UpdateResearchTypePayload;
    const index = researchTypesStore.findIndex((rt) => rt.id === id);
    if (index === -1) {
      return HttpResponse.json<ApiResponse<null>>({ success: false, message: "Not found", data: null }, { status: 404 });
    }
    researchTypesStore[index] = { ...researchTypesStore[index], ...body };
    const response: ApiResponse<ResearchType> = { success: true, data: researchTypesStore[index] };
    return HttpResponse.json(response);
  }),

  http.delete(`${API_BASE_URL}/cycles/research-types/:id`, async ({ params }) => {
    await delay(300);
    const id = Number(params.id);
    const index = researchTypesStore.findIndex((rt) => rt.id === id);
    if (index === -1) {
      return HttpResponse.json<ApiResponse<null>>({ success: false, message: "Not found", data: null }, { status: 404 });
    }
    researchTypesStore.splice(index, 1);
    const response: ApiResponse<null> = { success: true, data: null };
    return HttpResponse.json(response);
  }),
];
