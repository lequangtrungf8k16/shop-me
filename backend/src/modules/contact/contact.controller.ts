import type { Request, Response, NextFunction } from "express";
import * as contactService from "./contact.service";

export const submitContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id as number | undefined;
    const result = await contactService.createContactMessage({ ...req.body, userId });
    res.status(201).json({ status: "success", message: "Đã gửi tin nhắn", data: result });
  } catch (e) { next(e); }
};
