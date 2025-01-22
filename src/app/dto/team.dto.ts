export interface TeamDto {
    id?: number;
    name: string;
    active?: boolean;
    teamMemberIds: number[];
    projectIds: number[];
  }
  