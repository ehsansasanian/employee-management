import {Injectable} from '@angular/core'
import {BehaviorSubject} from 'rxjs'
import {Department} from '../models/department.model'

export type NewDepartment = Omit<Department, 'id'>

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private departmentsSubject = new BehaviorSubject<Department[]>([
    { id: 1, name: 'Department 1', employeeCount: 5 },
    { id: 2, name: 'Department 2', employeeCount: 8 },
    { id: 3, name: 'Department 3', employeeCount: 3 },
  ]);
  private nextId = 4;

  departments$ = this.departmentsSubject.asObservable();

  addDepartment(department: NewDepartment): void {
    const current = this.departmentsSubject.value;
    const newDepartment: Department = { ...department, id: this.nextId++ };
    this.departmentsSubject.next([...current, newDepartment]);
  }

  deleteDepartment(id: number): void {
    const current = this.departmentsSubject.value;
    this.departmentsSubject.next(current.filter(dep => dep.id !== id));
  }
}
