import {Component, Input} from '@angular/core';
import {Observable} from 'rxjs';
import {Employee} from '../models/employee.model';
import {EmployeeService} from '../services/employee.service';

@Component({
  selector: 'app-employee',
  standalone: false,
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.scss'
})
export class EmployeeComponent {
  employees$: Observable<Employee[]>;

  @Input()
  set departmentId(value: number | undefined) {
    this.employees$ = value == null ? this.employeeService.employees$ :
      this.employeeService.getEmployeesByDepartment(value);
  }

  constructor(private employeeService: EmployeeService) {
    this.employees$ = this.employeeService.employees$;
  }
}
