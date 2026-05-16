// Mở rộng kiểu Request của Express để thêm trường user
declare global {
   namespace Express {
      interface Request {
         user?: {
            id: number;
            email: string;
            role: string;
            iat?: number;
            exp?: number;
         };
      }
   }
}

export {};
