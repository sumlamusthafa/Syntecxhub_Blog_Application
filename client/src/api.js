const BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const TOKEN_KEY = "inkwell_token";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
  }
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(path, { method = "GET", body } = {}) {
  const headers = {};
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  if (body !== undefined && !isForm) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection and try again.", 0);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
  }

  if (!res.ok) {
    throw new ApiError(data?.message || `Request failed (${res.status})`, res.status);
  }
  return data;
}

export const api = {
  register: (body) => request("/api/auth/register", { method: "POST", body }),
  login: (body) => request("/api/auth/login", { method: "POST", body }),
  me: () => request("/api/auth/me"),
  listPosts: ({ page = 1, limit = 9, search = "", author = "" } = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (search) params.set("search", search);
    if (author) params.set("author", author);
    return request(`/api/posts?${params}`);
  },
  getPost: (id) => request(`/api/posts/${id}`),
  createPost: (body) => request("/api/posts", { method: "POST", body }),
  updatePost: (id, body) => request(`/api/posts/${id}`, { method: "PUT", body }),
  deletePost: (id) => request(`/api/posts/${id}`, { method: "DELETE" }),
  uploadImage: (file) => {
    const form = new FormData();
    form.append("image", file);
    return request("/api/images", { method: "POST", body: form });
  },
};
