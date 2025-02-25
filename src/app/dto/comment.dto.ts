export interface CommentDto {
  id?: number;
  content: string;
  creationDate?: string;
  userId: number;
  userFirstName?: string;
  userLastName?: string;
  userUsername?: string;
  projectId: number;
  modified?: boolean;
  modifiedDate?: string;
  deleted?: boolean;
  parentId?: number;
  parentContent?: string;
  parentCreationDate?: string;
  parentUserId?: number;
  parentUserFirstName?: string;
  parentUserLastName?: string;
  parentUserUsername?: string;
  parentModified?: boolean;
  parentModifiedDate?: string;
  parentDeleted?: boolean;
}
