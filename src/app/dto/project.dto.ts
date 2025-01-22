export interface ProjectDto {
    id?: number;
    name: string;
    description: string;
    priority?: string;
    startDate: string; 
    dueDate: string;
    completionDate?: string;
    status?: string;
    projectManagerId: number;
    taskIds?: number[];
    teamId?: number;
    commentIds?: number[];
  }
  