import { getApiBaseUrl, toApiUrl } from "./apiClient";

export const getApiOrigin = () => {
  const base = getApiBaseUrl();
  if (!base) {
    return window.location.origin;
  }
  try {
    return new URL(base).origin;
  } catch (_error) {
    return window.location.origin;
  }
};

export const resolveFileUrl = (filePath = "") => {
  if (!filePath) {
    return "";
  }
  if (/^https?:\/\//i.test(filePath)) {
    return filePath;
  }
  return toApiUrl(filePath.startsWith("/") ? filePath : `/${filePath}`);
};
