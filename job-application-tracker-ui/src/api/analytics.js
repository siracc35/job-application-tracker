import { api } from "./client";

export const getSummary = () =>
  api.get("/analytics/summary");

export const getTimeline = (days = 30) =>
  api.get("/analytics/timeline", { params: { days } });
