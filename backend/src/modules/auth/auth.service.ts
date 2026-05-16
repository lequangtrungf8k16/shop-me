import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { prisma } from "../../config/prisma.js";
import redisClient from "../../config/redis.js";

const JWT_SECRET =
   process.env["JWT_ACCESS_SECRET"] || "technology_secret_key_super_safe";

export const registerUser = async (data: {
   fullName: string;
   email: string;
   phone?: string;
   password: string;
}) => {
   const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
   });
   if (existingUser) throw new Error("Email này đã được sử dụng!");

   const salt = await bcrypt.genSalt(10);
   const hashedPassword = await bcrypt.hash(data.password, salt);

   const newUser = await prisma.user.create({
      data: {
         fullName: data.fullName,
         email: data.email,
         phone: data.phone ?? null,
         password: hashedPassword,
      },
   });

   return {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
   };
};

export const loginUser = async (data: { email: string; password: string }) => {
   const user = await prisma.user.findUnique({ where: { email: data.email } });
   if (!user) throw new Error("Email hoặc mật khẩu không chính xác!");

   // Kiểm tra tài khoản có bị khóa không
   if (!user.isActive)
      throw new Error("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ admin!");

   const isMatch = await bcrypt.compare(data.password, user.password);
   if (!isMatch) throw new Error("Email hoặc mật khẩu không chính xác!");

   const ACCESS_SECRET =
      process.env["JWT_ACCESS_SECRET"] || "default_access_secret";
   const REFRESH_SECRET =
      process.env["JWT_REFRESH_SECRET"] || "default_refresh_secret";

   const ACCESS_EXPIRES = (process.env["JWT_ACCESS_EXPIRES_IN"] ||
      "1d") as SignOptions["expiresIn"];
   const REFRESH_EXPIRES = (process.env["JWT_REFRESH_EXPIRES_IN"] ||
      "7d") as SignOptions["expiresIn"];

   const payload = { id: user.id, email: user.email, role: user.role };

   const accessToken = jwt.sign(payload, ACCESS_SECRET, {
      expiresIn: ACCESS_EXPIRES,
   });
   const refreshToken = jwt.sign(payload, REFRESH_SECRET, {
      expiresIn: REFRESH_EXPIRES,
   });

   return {
      accessToken,
      refreshToken,
      user: {
         id: user.id,
         fullName: user.fullName,
         email: user.email,
         role: user.role,
      },
   };
};

export const refreshAccessToken = async (refreshToken: string) => {
   if (!refreshToken) throw new Error("Refresh Token là bắt buộc!");

   const REFRESH_SECRET =
      process.env["JWT_REFRESH_SECRET"] || "default_refresh_secret";
   const ACCESS_SECRET =
      process.env["JWT_ACCESS_SECRET"] || "default_access_secret";

   const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as {
      id: number;
      email: string;
      role: string;
      exp: number;
   };

   const user = await prisma.user.findUnique({ where: { id: decoded.id } });
   if (!user) throw new Error("Người dùng không tồn tại!");
   if (!user.isActive) throw new Error("Tài khoản đã bị khóa!");

   // Blacklist token cũ
   const currentTime = Math.floor(Date.now() / 1000);
   const timeLeft = decoded.exp - currentTime;
   if (timeLeft > 0) {
      await redisClient.setEx(`blacklist_${refreshToken}`, timeLeft, "revoked");
   }

   const payload = { id: user.id, email: user.email, role: user.role };

   const ACCESS_EXPIRES = (process.env["JWT_ACCESS_EXPIRES_IN"] ||
      "1d") as SignOptions["expiresIn"];
   const REFRESH_EXPIRES = (process.env["JWT_REFRESH_EXPIRES_IN"] ||
      "7d") as SignOptions["expiresIn"];

   const newAccessToken = jwt.sign(payload, ACCESS_SECRET, {
      expiresIn: ACCESS_EXPIRES,
   });
   const newRefreshToken = jwt.sign(payload, REFRESH_SECRET, {
      expiresIn: REFRESH_EXPIRES,
   });

   return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};
