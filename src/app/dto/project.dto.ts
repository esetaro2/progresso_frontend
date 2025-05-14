export interface ProjectDto {
  id?: number;
  name: string;
  description: string;
  priority?: string;
  startDate: string;
  dueDate: string;
  completionDate?: string;
  completionPercentage?: number;
  status?: string;
  projectManagerId: number;
  projectManagerFirstName?: string;
  projectManagerLastName?: string;
  projectManagerUsername?: string;
  taskIds?: number[];
  teamId?: number;
  teamName?: string;
  commentIds?: number[];
}
