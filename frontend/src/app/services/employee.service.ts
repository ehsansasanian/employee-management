import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Employee} from '../models/employee.model';

@Injectable({providedIn: 'root'})
export class EmployeeService {
  private employeesSubject = new BehaviorSubject<Employee[]>([
    {id: 1, name: 'Alice Smith', departmentId: 1, position: 'Engineer'},
    {id: 2, name: 'Bob Johnson', departmentId: 2, position: 'Manager'},
    {id: 3, name: 'Carol Lee', departmentId: 1, position: 'Designer'},
    {id: 4, name: 'David Kim', departmentId: 3, position: 'QA'},
  ])

  employees$ = this.employeesSubject.asObservable();

  getEmployees(): Employee[] {
    return this.employeesSubject.value;
  }
}
