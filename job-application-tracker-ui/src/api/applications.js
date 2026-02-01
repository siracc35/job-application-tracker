import { api } from "./client";

export const listApplications = (params) => api.get("/applications", { params });

export const createApplication = (payload) => api.post("/applications", payload);

export const updateApplication = (id, payload) =>
  api.patch(`/applications/${id}`, payload);

export const softDeleteApplication = (id) =>
  api.delete(`/applications/${id}`);

export const updateApplicationStatus = (id, payload) =>
  api.patch(`/applications/${id}/status`, payload);

export const getApplication = (id) => api.get(`/applications/${id}`);

export const getApplicationHistory = (id) => api.get(`/applications/${id}/history`);


