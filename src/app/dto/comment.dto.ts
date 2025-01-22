export interface CommentDto {
    id?: number;
    content: string;
    creationDate?: string;
    userId: number;
    projectId: number;
    parentId?: number;
    replies?: CommentDto[];
    modified?: boolean;
    modifiedDate?: string;
    deleted?: boolean;
  }
  