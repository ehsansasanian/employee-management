import {Department} from './department.model';

export interface Employee {
  id: number
  fullName: string
  address: string
  phone: string
  email: string
  department: Department | null
}

export interface EmployeeRequestDTO {
  firstname: string
  lastname: string
  address: string
  phone: string
  email: string
  departmentId?: number
}
