"use client";

import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api").replace("/api", "");

export default function SocketProvider() {
   const { user, token } = useAuthStore();
   const socketRef = useRef<Socket | null>(null);

   useEffect(() => {
      if (!token || !user) {
         if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
         }
         return;
      }

      const socket = io(API_BASE, {
         path: "/socket.io",
         transports: ["websocket", "polling"],
      });

      socket.on("connect", () => {
         socket.emit("join_user_room", user.id);
      });

      socket.on("notification:new", (data: { title: string; message: string; type: string }) => {
         toast.info(data.title, {
            description: data.message,
            duration: 5000,
         });
      });

      socketRef.current = socket;

      return () => {
         socket.disconnect();
         socketRef.current = null;
      };
   }, [user, token]);

   return null;
}
