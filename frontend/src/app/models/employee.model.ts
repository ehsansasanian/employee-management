import { Department } from './department.model';

export interface Employee {
  id: number
  fullName: string
  department: Department | null
}
