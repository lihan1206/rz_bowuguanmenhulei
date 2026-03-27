import { http } from "./client";
import type {
  AdminCommentItem,
  AdminOverview,
  AnnouncementItem,
  ExhibitDetail,
  ExhibitItem,
  ExhibitionItem,
  GuideInfo,
  HomePayload,
  UserInfo,
  VisitItem,
} from "./types";

export const api = {
  me: async () => (await http.get<UserInfo>("/auth/me")).data,
  register: async (payload: Record<string, unknown>) => (await http.post<UserInfo>("/auth/register", payload)).data,
  login: async (payload: Record<string, unknown>) => (await http.post<UserInfo>("/auth/login", payload)).data,
  logout: async () => (await http.post("/auth/logout")).data,
  home: async () => (await http.get<HomePayload>("/public/home")).data,
  exhibits: async (q = "") => (await http.get<ExhibitItem[]>("/public/exhibits", { params: { q } })).data,
  exhibitDetail: async (id: number) => (await http.get<ExhibitDetail>(`/public/exhibits/${id}`)).data,
  exhibitions: async (q = "") => (await http.get<ExhibitionItem[]>("/public/exhibitions", { params: { q } })).data,
  announcements: async () => (await http.get<AnnouncementItem[]>("/public/announcements")).data,
  guide: async () => (await http.get<GuideInfo>("/public/guide")).data,
  createComment: async (payload: Record<string, unknown>) => (await http.post("/comments", payload)).data,
  removeComment: async (id: number) => (await http.delete(`/comments/${id}`)).data,
  myVisits: async () => (await http.get<VisitItem[]>("/visits/mine")).data,
  createVisit: async (payload: Record<string, unknown>) => (await http.post<VisitItem>("/visits", payload)).data,
  cancelVisit: async (id: number) => (await http.delete(`/visits/${id}`)).data,
  adminOverview: async () => (await http.get<AdminOverview>("/admin/overview")).data,
  adminExhibits: async () => (await http.get<ExhibitItem[]>("/admin/exhibits")).data,
  adminCreateExhibit: async (payload: Record<string, unknown>) =>
    (await http.post<ExhibitItem>("/admin/exhibits", payload)).data,
  adminUpdateExhibit: async (id: number, payload: Record<string, unknown>) =>
    (await http.put<ExhibitItem>(`/admin/exhibits/${id}`, payload)).data,
  adminDeleteExhibit: async (id: number) => (await http.delete(`/admin/exhibits/${id}`)).data,
  adminExhibitions: async () => (await http.get<ExhibitionItem[]>("/admin/exhibitions")).data,
  adminCreateExhibition: async (payload: Record<string, unknown>) =>
    (await http.post<ExhibitionItem>("/admin/exhibitions", payload)).data,
  adminUpdateExhibition: async (id: number, payload: Record<string, unknown>) =>
    (await http.put<ExhibitionItem>(`/admin/exhibitions/${id}`, payload)).data,
  adminDeleteExhibition: async (id: number) => (await http.delete(`/admin/exhibitions/${id}`)).data,
  adminAnnouncements: async () => (await http.get<AnnouncementItem[]>("/admin/announcements")).data,
  adminCreateAnnouncement: async (payload: Record<string, unknown>) =>
    (await http.post<AnnouncementItem>("/admin/announcements", payload)).data,
  adminUpdateAnnouncement: async (id: number, payload: Record<string, unknown>) =>
    (await http.put<AnnouncementItem>(`/admin/announcements/${id}`, payload)).data,
  adminDeleteAnnouncement: async (id: number) => (await http.delete(`/admin/announcements/${id}`)).data,
  adminGuide: async () => (await http.get<GuideInfo>("/admin/guide")).data,
  adminUpdateGuide: async (payload: Record<string, unknown>) => (await http.put<GuideInfo>("/admin/guide", payload)).data,
  adminVisits: async () => (await http.get<VisitItem[]>("/admin/visits")).data,
  adminDeleteVisit: async (id: number) => (await http.delete(`/admin/visits/${id}`)).data,
  adminComments: async () => (await http.get<AdminCommentItem[]>("/admin/comments")).data,
  adminDeleteComment: async (id: number) => (await http.delete(`/admin/comments/${id}`)).data,
};

