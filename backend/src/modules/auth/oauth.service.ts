import axios from "axios";
import jwt, { type SignOptions } from "jsonwebtoken";
import { prisma } from "../../config/prisma";

export const getGoogleAuthUrl = (): string => {
  const params = new URLSearchParams({
    client_id: process.env["GOOGLE_CLIENT_ID"] ?? "",
    redirect_uri: process.env["GOOGLE_CALLBACK_URL"] ?? "",
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
};

export const handleGoogleCallback = async (code: string) => {
  // Exchange code for tokens
  const tokenRes = await axios.post<{ access_token: string }>(
    "https://oauth2.googleapis.com/token",
    {
      code, client_id: process.env["GOOGLE_CLIENT_ID"],
      client_secret: process.env["GOOGLE_CLIENT_SECRET"],
      redirect_uri: process.env["GOOGLE_CALLBACK_URL"],
      grant_type: "authorization_code",
    },
  );

  // Get user info
  const userRes = await axios.get<{
    id: string; email: string; name: string; picture: string; verified_email: boolean;
  }>("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenRes.data.access_token}` },
  });

  const googleUser = userRes.data;
  if (!googleUser.verified_email) throw new Error("Email Google chưa xác thực");

  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId: googleUser.id }, { email: googleUser.email }] },
  });

  if (user) {
    if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: googleUser.id, avatar: googleUser.picture },
      });
    }
  } else {
    user = await prisma.user.create({
      data: {
        fullName: googleUser.name, email: googleUser.email,
        googleId: googleUser.id, avatar: googleUser.picture,
        password: "", isActive: true,
      },
    });
  }

  if (!user.isActive) throw new Error("Tài khoản đã bị khóa");

  const payload = { id: user.id, email: user.email, role: user.role };
  const ACCESS_SECRET = process.env["JWT_ACCESS_SECRET"] ?? "secret";
  const REFRESH_SECRET = process.env["JWT_REFRESH_SECRET"] ?? "refresh";
  const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: (process.env["JWT_ACCESS_EXPIRES_IN"] ?? "1d") as SignOptions["expiresIn"] });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: (process.env["JWT_REFRESH_EXPIRES_IN"] ?? "7d") as SignOptions["expiresIn"] });

  return { accessToken, refreshToken, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, avatar: user.avatar } };
};
