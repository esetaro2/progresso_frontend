export interface TaskDto {
    id?: number;
    name: string;
    description: string;
    priority: string;
    startDate: string;
    dueDate: string;
    completionDate?: string;
    status?: string;
    projectId: number;
    assignedUserId?: number,
    assignedUserUsername?: string;
  }
  