const API_BASE = "http://localhost:8080";
const UNEXPECTED_RESPONSE = "The account service returned an unexpected response. Please try again.";

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  avatarUrl: string | null;
};

export type LoginInput = {
  username: string;
  password: string;
};

export type SignUpInput = LoginInput & { email: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readUser(value: unknown): AuthUser {
  if (!isRecord(value)) throw new Error(UNEXPECTED_RESPONSE);
  const { id, username, email, avatar_url: avatarUrl } = value;
  if (
    typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0 ||
    typeof username !== "string" || !username.trim() ||
    typeof email !== "string" || !email.trim() ||
    (avatarUrl != null && typeof avatarUrl !== "string")
  ) {
    throw new Error(UNEXPECTED_RESPONSE);
  }
  return { id, username, email, avatarUrl: avatarUrl?.trim() || null };
}

async function postAccount(path: "/register" | "/login", input: LoginInput, signal?: AbortSignal): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(API_BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error("Could not reach the account service. Check your connection and try again.");
  }

  if (response.status === 401) throw new Error("Incorrect username or password.");
  if (response.status === 409) throw new Error("That username or email is already in use.");

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error(UNEXPECTED_RESPONSE);
  }
  if (!response.ok) {
    if (response.status === 400 && isRecord(body) && typeof body.error === "string" && body.error.trim()) {
      throw new Error(body.error);
    }
    throw new Error("The account service could not complete your request. Please try again.");
  }
  if (response.status !== (path === "/register" ? 201 : 200)) throw new Error(UNEXPECTED_RESPONSE);
  return body;
}

export async function signUp(input: SignUpInput, signal?: AbortSignal): Promise<AuthUser> {
  return readUser(await postAccount("/register", input, signal));
}

export async function login(input: LoginInput, signal?: AbortSignal): Promise<AuthUser> {
  const body = await postAccount("/login", input, signal);
  if (!isRecord(body) || typeof body.message !== "string") throw new Error(UNEXPECTED_RESPONSE);
  return readUser(body.user);
}
