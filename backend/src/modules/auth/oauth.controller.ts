import type { Request, Response } from "express";
import { getGoogleAuthUrl, handleGoogleCallback } from "./oauth.service";

export const googleRedirect = (_req: Request, res: Response) => {
  res.redirect(getGoogleAuthUrl());
};

export const googleCallback = async (req: Request, res: Response) => {
  const APP_URL = process.env["APP_URL"] ?? "http://localhost:8080";
  const { code, error } = req.query as { code?: string; error?: string };

  if (error || !code) {
    res.redirect(`${APP_URL}/login?error=oauth_cancelled`);
    return;
  }

  try {
    const result = await handleGoogleCallback(code);
    const params = new URLSearchParams({
      access_token: result.accessToken,
      refresh_token: result.refreshToken,
      user: JSON.stringify(result.user),
    });
    res.redirect(`${APP_URL}/oauth/callback?${params}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi OAuth";
    res.redirect(`${APP_URL}/login?error=${encodeURIComponent(msg)}`);
  }
};
