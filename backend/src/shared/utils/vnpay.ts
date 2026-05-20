import crypto from "crypto";
import querystring from "querystring";

export function sortObject(obj: Record<string, any>) {
   const sorted: Record<string, string> = {};
   const keys = Object.keys(obj).sort();
   for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
         sorted[key] = String(obj[key]);
      }
   }
   return sorted;
}

export function formatDateTime(date: Date) {
   const yyyy = date.getFullYear().toString();
   const mm = (date.getMonth() + 1).toString().padStart(2, "0");
   const dd = date.getDate().toString().padStart(2, "0");
   const HH = date.getHours().toString().padStart(2, "0");
   const MM = date.getMinutes().toString().padStart(2, "0");
   const ss = date.getSeconds().toString().padStart(2, "0");
   return `${yyyy}${mm}${dd}${HH}${MM}${ss}`;
}

export function generateVnpayUrl(
   ipAddr: string,
   amount: number,
   orderInfo: string,
   orderId: string,
) {
   const tmnCode = process.env.VNP_TMN_CODE || "VNPAY_TMN";
   const secretKey = process.env.VNP_HASH_SECRET || "VNPAY_SECRET";
   let vnpUrl = process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
   const returnUrl = process.env.VNP_RETURN_URL || "http://localhost:3000/checkout/vnpay-return";

   const date = new Date();
   const createDate = formatDateTime(date);

   // Hết hạn sau 15 phút
   date.setMinutes(date.getMinutes() + 15);
   const expireDate = formatDateTime(date);

   let vnp_Params: Record<string, any> = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: tmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: "other",
      vnp_Amount: Math.floor(amount * 100), // Tính bằng VNĐ, nhân 100 theo format VNPAY
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
   };

   vnp_Params = sortObject(vnp_Params);

   const signData = querystring.stringify(vnp_Params, { encode: false });
   const hmac = crypto.createHmac("sha512", secretKey);
   const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
   
   // Encode URI components cho url an toàn
   const urlParams = new URLSearchParams(vnp_Params);
   urlParams.set("vnp_SecureHash", signed);

   vnpUrl += "?" + urlParams.toString();
   return vnpUrl;
}

export function verifyVnpayReturn(vnp_Params: Record<string, any>) {
   const secureHash = vnp_Params["vnp_SecureHash"];
   delete vnp_Params["vnp_SecureHash"];
   delete vnp_Params["vnp_SecureHashType"];

   const sortedParams = sortObject(vnp_Params);
   const secretKey = process.env.VNP_HASH_SECRET || "VNPAY_SECRET";
   
   const signData = querystring.stringify(sortedParams, { encode: false });
   const hmac = crypto.createHmac("sha512", secretKey);
   const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

   return secureHash === signed;
}
