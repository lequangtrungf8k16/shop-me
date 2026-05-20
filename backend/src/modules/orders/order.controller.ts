import type { Request, Response, NextFunction } from "express";
import * as orderService from "./order.service";
import type { ApiResponse } from "../../shared/types/index";
import { generateVnpayUrl, verifyVnpayReturn } from "../../shared/utils/vnpay";
import { prisma } from "../../config/prisma";

export const createOrderController = async (
   req: Request,
   res: Response,
   next: NextFunction,
): Promise<void> => {
   try {
      const newOrder = await orderService.createOrder(req.body);
      
      let paymentUrl: string | undefined;
      if (req.body.paymentMethod === 'VNPAY') {
         const ipAddr = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
         paymentUrl = generateVnpayUrl(
            Array.isArray(ipAddr) ? ipAddr[0] : ipAddr,
            Number(newOrder.totalAmount),
            `Thanh toan don hang ${newOrder.id}`,
            String(newOrder.id)
         );
      }

      const response: ApiResponse = {
         status: "success",
         message: "Đặt hàng thành công",
         data: {
             ...newOrder,
             paymentUrl
         },
      };
      res.status(201).json(response);
   } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes("không tồn tại") || msg.includes("chỉ còn")) {
         res.status(400).json({ status: "error", message: msg });
         return;
      }
      next(error);
   }
};

export const vnpayIpnController = async (
   req: Request,
   res: Response,
   next: NextFunction,
): Promise<void> => {
   try {
      const vnp_Params = req.query;
      const isValid = verifyVnpayReturn(vnp_Params as Record<string, any>);

      if (isValid) {
         const orderId = Number(vnp_Params['vnp_TxnRef']);
         const rspCode = vnp_Params['vnp_ResponseCode'];

         if (rspCode === '00') {
            // Cập nhật trạng thái đơn hàng thành đã thanh toán
            await prisma.order.update({
               where: { id: orderId },
               data: { isPaid: true, status: "PROCESSING" }
            });
            res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
         } else {
            // Thanh toán thất bại
            res.status(200).json({ RspCode: '00', Message: 'Payment failed' });
         }
      } else {
         res.status(200).json({ RspCode: '97', Message: 'Invalid signature' });
      }
   } catch (error) {
      next(error);
   }
};

export const getOrderController = async (
   req: Request,
   res: Response,
   next: NextFunction,
): Promise<void> => {
   try {
      const id = Number(req.params["id"]);
      if (isNaN(id)) {
         res.status(400).json({
            status: "error",
            message: "ID đơn hàng không hợp lệ",
         });
         return;
      }

      const order = await orderService.getOrderById(id);
      const response: ApiResponse = {
         status: "success",
         message: "Lấy thông tin đơn hàng thành công",
         data: order,
      };
      res.status(200).json(response);
   } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "";
      if (msg === "Đơn hàng không tồn tại") {
         res.status(404).json({ status: "error", message: msg });
         return;
      }
      next(error);
   }
};
