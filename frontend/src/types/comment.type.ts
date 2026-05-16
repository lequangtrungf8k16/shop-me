export interface CommentReaction {
   type: "LIKE" | "DISLIKE";
   userId: number;
}

export interface Comment {
   id: number;
   content: string;
   isDeleted: boolean;
   parentId: number | null;
   createdAt: string;
   user: { id: number; fullName: string };
   reactions: CommentReaction[];
   replies?: Comment[];
}

export interface CommentsApiResponse {
   comments: Comment[];
   pagination: { total: number; page: number; totalPages: number };
}
