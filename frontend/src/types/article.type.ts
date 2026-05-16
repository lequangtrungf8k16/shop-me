export interface ArticleSummary {
   id: number;
   title: string;
   slug: string;
   excerpt: string | null;
   thumbnail: string | null;
   views: number;
   createdAt: string;
   author: { id: number; fullName: string };
   _count: { comments: number; reactions: number };
}

export interface Article extends ArticleSummary {
   content: string;
}
