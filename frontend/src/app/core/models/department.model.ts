export interface Department {
  id: string; // Or number, depending on backend
  name: string;
  employeeCount?: number; // Optional, can be calculated
}
