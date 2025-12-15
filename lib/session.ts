import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "default-secret-key-change-this-in-production"
);

const SESSION_DURATION = 7 * 24 * 60 * 60; // 7 天（秒）

/**
 * 创建会话令牌并存储在 Cookie 中
 */
export async function createSession() {
  const token = await new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);

  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });
}

/**
 * 验证会话令牌是否有效
 */
export async function verifySession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return false;
  }

  try {
    await jwtVerify(token, SECRET_KEY);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 删除会话令牌
 */
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
