import { Server as HttpServer } from "http";
import { Server as SocketIOServer, type Socket } from "socket.io";

let io: SocketIOServer | null = null;

export const initSocket = (httpServer: HttpServer): SocketIOServer => {
  const allowedOrigins = (process.env["ALLOWED_ORIGINS"] ?? "http://localhost")
    .split(",").map((o) => o.trim());

  io = new SocketIOServer(httpServer, {
    cors: { origin: allowedOrigins, methods: ["GET", "POST"], credentials: true },
    path: "/socket.io",
  });

  io.on("connection", (socket: Socket) => {
    socket.on("join_user_room", (userId: number) => socket.join(`user:${userId}`));
    socket.on("join_admin_room", () => socket.join("admin"));
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) throw new Error("Socket.IO chưa khởi tạo");
  return io;
};
