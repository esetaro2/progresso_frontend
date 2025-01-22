export interface UserResponseDto {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    role: string;
    assignedTaskIds: number[];
    managedProjectIds: number[];
    teamIds: number[];
    commentIds: number[];
    active: boolean;
  }
  