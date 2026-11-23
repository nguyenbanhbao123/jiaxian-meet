import type { AuthUser } from "../components/home/Avatar";

const API_BASE = "http://localhost:8080";

export type SignUpInput = {
  username: string;
  email: string;
  password: string;
};

export type LoginInput = {
  username: string;
  password: string;
};

async function postJson<T>(path: string, payload: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export function signUp(input: SignUpInput): Promise<AuthUser> {
  return postJson<AuthUser>("/create", input);
}

export async function login(input: LoginInput): Promise<AuthUser> {
  const data = await postJson<any>("/login", input);

  return {
    id: data.id,
    username: data.username ?? data.user_name ?? "",
    avatarUrl: data.avatarUrl ?? data.avatar_url ?? null,
  };
}