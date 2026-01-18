import { apiClient } from './client';

// Matches ShiftAssignmentDto from Spring Boot
export interface ShiftAssignment {
  shiftId: number;
  staffId: number;
  staffName: string;
}

// Matches RosterResponseDto from Spring Boot
export interface RosterResponse {
  date: string;
  assignments: ShiftAssignment[];
  coveragePercentage: number;
  overtimeRisk: boolean;
}

export async function generateRoster(date: string): Promise<RosterResponse> {
  const params = new URLSearchParams({ date });
  const { data } = await apiClient.post<RosterResponse>(
    `/demo/roster/generate?${params.toString()}`,
    {}
  );
  return data;
}

// Matches Shift entity from Spring Boot
export interface Shift {
  id?: number;
  shiftDate: string;
  startTime: string;
  endTime: string;
  requiredSkill: string;
  assignedStaffId?: number;
  status: string;
}

export async function generateDefaultShifts(date?: string): Promise<Shift[]> {
  const params = date ? new URLSearchParams({ date }) : new URLSearchParams();
  const { data } = await apiClient.post<Shift[]>(
    `/demo/shifts/generate-default?${params.toString()}`,
    {}
  );
  return data;
}
