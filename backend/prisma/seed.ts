import "dotenv/config";
import { prisma } from "../src/config/prisma.js";
import { fakerVI as faker } from "@faker-js/faker";
import slugify from "slugify";
import bcrypt from "bcryptjs";

const createSlug = (text: string): string =>
   slugify(text, { lower: true, strict: true, locale: "vi", trim: true });

// ─── TỪ ĐIỂN ẢNH ĐƯỢC PHÂN LOẠI CHUẨN XÁC THEO TỪNG DANH MỤC ───────────────
const categoryImages: Record<string, string[]> = {
   "laptop-gaming": [
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80",
   ],
   "linh-kien-pc": [
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=800&q=80",
   ],
   "man-hinh": [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1551645120-d70bfe84c826?auto=format&fit=crop&w=800&q=80",
   ],
   "gaming-gear": [
      "https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&w=800&q=80",
   ],
   "ban-phim-co": [
      "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80",
   ],
   "chuot-gaming": [
      "https://images.unsplash.com/photo-1615663245857-ac93be9c9023?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1527814050087-37938154733e?auto=format&fit=crop&w=800&q=80",
   ],
   "tai-nghe": [
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80",
   ],
   "card-do-hoa": [
      "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=800&q=80",
   ],
};

// Kho ảnh cho Bài viết (Góc setup, phong cách công nghệ)
const articleImages = [
   "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80",
   "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80",
   "https://images.unsplash.com/photo-1531297172864-8dfcc7de8db0?auto=format&fit=crop&w=1000&q=80",
   "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80",
];

async function main() {
   console.log("🌱 Bắt đầu Seeding...");

   // ─── Xóa dữ liệu cũ (đúng thứ tự FK) ────────────────────────────────────
   await prisma.notification.deleteMany();
   await prisma.reaction.deleteMany();
   await prisma.comment.deleteMany();
   await prisma.review.deleteMany();
   await prisma.orderItem.deleteMany();
   await prisma.order.deleteMany();
   await prisma.article.deleteMany();
   await prisma.product.deleteMany();
   await prisma.category.deleteMany();
   await prisma.user.deleteMany();
   console.log("🧹 Đã xóa sạch dữ liệu cũ.");

   const categoryData: Record<string, { names: string[]; images: string[] }> = {
      "laptop-gaming": {
         names: [
            "Laptop ASUS ROG Strix G15",
            "Laptop Acer Nitro 5",
            "Laptop MSI Katana GF66",
            "Laptop Dell Alienware m15",
            "Laptop Lenovo Legion 5 Pro",
            "Laptop Gigabyte Aorus 15",
         ],
         images: [
            "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=640&h=480&q=80",
            "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=640&h=480&q=80",
            "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=640&h=480&q=80",
         ],
      },
      "linh-kien-pc": {
         names: [
            "Mainboard ASUS ROG Maximus",
            "CPU Intel Core i9 14900K",
            "RAM Corsair Vengeance 32GB RGB",
            "Nguồn Corsair RM850x 80 Plus Gold",
            "Tản nhiệt nước AIO Cooler Master",
            "Vỏ Case NZXT H510 Flow",
         ],
         images: [
            "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=640&h=480&q=80",
            "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=640&h=480&q=80",
         ],
      },
      "man-hinh": {
         names: [
            "Màn hình ASUS TUF Gaming 27 inch 165Hz",
            "Màn hình LG UltraGear 24 inch 144Hz",
            "Màn hình Samsung Odyssey G5",
            "Màn hình Dell Alienware 240Hz",
         ],
         images: [
            "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=640&h=480&q=80",
            "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?auto=format&fit=crop&w=640&h=480&q=80",
         ],
      },
      "gaming-gear": {
         names: [
            "Tay cầm Xbox Series X Wireless",
            "Tay cầm DualSense PS5",
            "Microphone HyperX QuadCast",
            "Webcam Logitech C922 Pro",
         ],
         images: [
            "https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=640&h=480&q=80",
            "https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&w=640&h=480&q=80",
         ],
      },
      "ban-phim-co": {
         names: [
            "Bàn phím cơ Akko 3098B",
            "Bàn phím cơ Keychron K2",
            "Bàn phím Logitech G Pro X",
            "Bàn phím Corsair K70 RGB MK.2",
            "Bàn phím Razer BlackWidow V3",
         ],
         images: [
            "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=640&h=480&q=80",
            "https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?auto=format&fit=crop&w=640&h=480&q=80",
            "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=640&h=480&q=80",
         ],
      },
      "chuot-gaming": {
         names: [
            "Chuột Logitech G Pro X Superlight",
            "Chuột Razer DeathAdder V3",
            "Chuột Zowie EC2-C",
            "Chuột Corsair Harpoon RGB",
         ],
         images: [
            "https://images.unsplash.com/photo-1527814050087-37938154733e?auto=format&fit=crop&w=640&h=480&q=80",
            "https://images.unsplash.com/photo-1615663245857-ac93be9c9023?auto=format&fit=crop&w=640&h=480&q=80",
         ],
      },
      "tai-nghe": {
         names: [
            "Tai nghe HyperX Cloud II",
            "Tai nghe Logitech G733",
            "Tai nghe Razer BlackShark V2",
            "Tai nghe Corsair Virtuoso",
         ],
         images: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=640&h=480&q=80",
            "https://images.unsplash.com/photo-1612222869049-d8ec83637a3c?auto=format&fit=crop&w=640&h=480&q=80",
         ],
      },
      "card-do-hoa": {
         names: [
            "VGA NVIDIA GeForce RTX 4090 24GB",
            "VGA AMD Radeon RX 7900 XTX",
            "VGA ASUS TUF RTX 3060 Ti",
            "VGA Gigabyte RTX 4070 Aero OC",
         ],
         images: [
            "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=640&h=480&q=80",
            "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=640&h=480&q=80",
         ],
      },
   };

   // ─── 1. Users ─────────────────────────────────────────────────────────────
   const passwordHash = await bcrypt.hash("123456", 10);

   const adminUser = await prisma.user.create({
      data: {
         fullName: "Admin Hệ Thống",
         email: "admin@shop.com",
         password: passwordHash,
         role: "ADMIN",
         phone: "0901234567",
         isActive: true,
      },
   });

   const testUser = await prisma.user.create({
      data: {
         fullName: "user 01",
         email: "user@shop.com",
         password: passwordHash,
         role: "USER",
         phone: "0987654321",
         isActive: true,
      },
   });

   const randomUsers = await Promise.all(
      Array.from({ length: 5 }).map(() =>
         prisma.user.create({
            data: {
               fullName: faker.person.fullName(),
               email: faker.internet.email().toLowerCase(),
               password: passwordHash,
               role: "USER",
               phone: "09" + faker.string.numeric(8),
               isActive: true,
            },
         }),
      ),
   );

   const allUsers = [testUser, ...randomUsers];
   console.log(`✅ Đã tạo ${allUsers.length + 1} users.`);

   // ─── 2. Categories ────────────────────────────────────────────────────────
   const categoryNames = [
      "Laptop Gaming",
      "Linh Kiện PC",
      "Màn Hình",
      "Gaming Gear",
      "Bàn Phím Cơ",
      "Chuột Gaming",
      "Tai Nghe",
      "Card Đồ Họa",
   ];

   const categories = await Promise.all(
      categoryNames.map((name) =>
         prisma.category.create({
            data: { name, slug: createSlug(name), isActive: true },
         }),
      ),
   );
   console.log(`✅ Đã tạo ${categories.length} danh mục.`);

   // ─── 3. Products ──────────────────────────────────────────────────────────
   const slugSet = new Set<string>();
   const productsToCreate = [];

   for (let i = 0; i < 60; i++) {
      const cat = categories[Math.floor(Math.random() * categories.length)]!;
      const catData = categoryData[cat.slug] || categoryData["laptop-gaming"];

      // Lấy ngẫu nhiên tên thật từ danh sách thay vì dùng faker.commerce
      const baseName =
         catData.names[Math.floor(Math.random() * catData.names.length)];
      const suffix = faker.string.alphanumeric(4).toUpperCase();
      const productName = `${baseName} (Mã: ${suffix})`;

      const slug = createSlug(productName);
      if (slugSet.has(slug)) continue;
      slugSet.add(slug);

      const price = faker.number.int({ min: 500_000, max: 10_000_000 });
      const hasDiscount = faker.datatype.boolean({ probability: 0.35 });
      const priceDiscount = hasDiscount
         ? Math.floor(
              price * (1 - faker.number.int({ min: 10, max: 40 }) / 100),
           )
         : null;

      const randomImage =
         catData.images[Math.floor(Math.random() * catData.images.length)];

      productsToCreate.push({
         name: productName,
         slug,
         description: faker.lorem.paragraph(),
         price,
         priceDiscount,
         stock: faker.number.int({ min: 5, max: 100 }),
         thumbnail: randomImage,
         categoryId: cat.id,
      });
   }

   const { count: productCount } = await prisma.product.createMany({
      data: productsToCreate,
      skipDuplicates: true,
   });
   const products = await prisma.product.findMany({ take: productCount });
   console.log(`✅ Đã tạo ${productCount} sản phẩm với TÊN VÀ ẢNH CỰC CHUẨN.`);

   // ─── 4. Articles ──────────────────────────────────────────────────────────
   const articleTitles = [
      "Top 5 Laptop Gaming Mạnh Nhất",
      "Hướng Dẫn Chọn Màn Hình Gaming",
      "So Sánh RTX 5080 vs RX 9070 XT",
      "Bàn Phím Cơ Switch Nào Phù Hợp?",
      "Cách Tối Ưu FPS Trong Game",
      "Review Chuột Logitech Mới Nhất",
      "Xu Hướng PC Gaming",
      "DDR5 vs DDR4: Có Đáng Nâng Cấp?",
   ];

   const articleSlugsSet = new Set<string>();
   for (const title of articleTitles) {
      const slug = createSlug(title);
      if (articleSlugsSet.has(slug)) continue;
      articleSlugsSet.add(slug);

      const randomArticleImg =
         articleImages[Math.floor(Math.random() * articleImages.length)];

      await prisma.article.create({
         data: {
            title,
            slug,
            excerpt: faker.lorem.sentences(2),
            content: `<h2>${title}</h2><p>${faker.lorem.paragraphs(4, "</p><p>")}</p>`,
            thumbnail: randomArticleImg,
            published: true,
            authorId: adminUser.id,
         },
      });
   }
   console.log(`✅ Đã tạo ${articleTitles.length} bài viết.`);

   // ─── 5. Orders ────────────────────────────────────────────────────────────
   const statuses = [
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
   ] as const;

   for (let i = 0; i < 15; i++) {
      const user = allUsers[Math.floor(Math.random() * allUsers.length)]!;
      const numItems = faker.number.int({ min: 1, max: 3 });
      const selectedProducts = faker.helpers.arrayElements(products, numItems);

      let subTotal = 0;
      const items = selectedProducts.map((p) => {
         const qty = faker.number.int({ min: 1, max: 3 });
         const price = Number(p.priceDiscount ?? p.price);
         subTotal += price * qty;
         return {
            productId: p.id,
            quantity: qty,
            price: p.priceDiscount ?? p.price,
         };
      });

      await prisma.order.create({
         data: {
            customerName: user.fullName,
            customerPhone: user.phone ?? "0900000000",
            shippingAddress: faker.location.streetAddress(),
            totalAmount: Math.round(subTotal * 1.1),
            status: faker.helpers.arrayElement(statuses),
            paymentMethod: faker.helpers.arrayElement(["COD", "VNPAY"]),
            userId: user.id,
            orderItems: { create: items },
         },
      });
   }
   console.log("✅ Đã tạo 15 đơn hàng mẫu.");

   // ─── 6. Notifications ─────────────────────────────────────────────────
   await prisma.notification.createMany({
      data: [
         {
            userId: testUser.id,
            type: "ORDER_PLACED",
            title: "Đặt hàng thành công",
            message: "Đơn hàng #1 của bạn đã được tiếp nhận.",
            metadata: { orderId: 1 },
         },
      ],
   });
   console.log("✅ Đã tạo thông báo mẫu.\n🎉 Seeding hoàn tất!");
}

main()
   .catch((e) => {
      console.error("❌ Lỗi Seeding:", e);
      process.exit(1);
   })
   .finally(async () => {
      await prisma.$disconnect();
   });
