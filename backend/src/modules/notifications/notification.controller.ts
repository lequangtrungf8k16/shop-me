import type { Request, Response, NextFunction } from "express";
import * as notifService from "./notification.service";

export const getMyNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id as number;
    const result = await notifService.getUserNotifications(userId, Number(req.query["page"]) || 1);
    res.json({ status: "success", data: result });
  } catch (e) { next(e); }
};

export const getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await notifService.getUnreadCount((req as any).user.id as number);
    res.json({ status: "success", data: { count } });
  } catch (e) { next(e); }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id as number;
    const id = req.params["id"] ? Number(req.params["id"]) : undefined;
    await notifService.markAsRead(userId, id);
    res.json({ status: "success", message: "Đã đánh dấu đã đọc" });
  } catch (e) { next(e); }
};
