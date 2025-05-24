import { Department } from './department.model';

export interface Employee {
  id: number
  name: string
  department: Department | null
}
