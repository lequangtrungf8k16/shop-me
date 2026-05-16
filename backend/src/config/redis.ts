import { createClient } from "redis";

// Sử dụng URL từ .env hoặc mặc định của Docker local
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const redisClient = createClient({ url: redisUrl });

redisClient.on("error", (err) => console.log("❌ Redis Client Error", err));
redisClient.on("connect", () => console.log("🚀 Đã kết nối tới Redis"));

// Bật kết nối
redisClient.connect();

export default redisClient;
