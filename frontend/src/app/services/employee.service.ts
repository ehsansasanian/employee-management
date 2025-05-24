import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Employee} from '../models/employee.model';
import {Department} from '../models/department.model';
import {map} from 'rxjs/operators';

const DEPARTMENTS: Department[] = [
  { id: 1, name: 'Engineering', employeeCount: 0 },
  { id: 2, name: 'Management', employeeCount: 0 },
  { id: 3, name: 'QA', employeeCount: 0 },
];

@Injectable({providedIn: 'root'})
export class EmployeeService {
  private employeesSubject = new BehaviorSubject<Employee[]>([
    {id: 1, name: 'Alice Smith', department: DEPARTMENTS[0]},
    {id: 2, name: 'Bob Johnson', department: DEPARTMENTS[1]},
    {id: 3, name: 'Carol Lee', department: DEPARTMENTS[0]},
    {id: 4, name: 'David Kim', department: DEPARTMENTS[2]},
    {id: 5, name: 'Eve Unassigned', department: null},
  ]);

  employees$ = this.employeesSubject.asObservable();

  getEmployees(): Employee[] {
    return this.employeesSubject.value;
  }

  getEmployeesByDepartment(departmentId: number): Observable<Employee[]> {
    return this.employees$.pipe(
      map(employees => employees.filter(e => e.department?.id === departmentId))
    );
  }
}
