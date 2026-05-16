export interface IChatMessage {
   role: "user" | "assistant";
   content: string;
}

export interface IGenerateArticlePayload {
   topic: string;
   keywords?: string;
   targetLength?: "short" | "medium" | "long";
}

export interface IGeneratedArticle {
   id: number;
   title: string;
   slug: string;
   excerpt: string | null;
   thumbnail: string | null;
   createdAt: string;
   author: { fullName: string };
}

export interface IDraftArticlesResponse {
   articles: IGeneratedArticle[];
   pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
   };
}
