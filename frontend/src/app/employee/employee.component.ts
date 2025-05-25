import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subject, takeUntil, tap} from 'rxjs';
import {Employee} from '../models/employee.model';
import {EmployeeService} from '../services/employee.service';

@Component({
  selector: 'app-employee',
  standalone: false,
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.scss'
})
export class EmployeeComponent implements OnInit, OnDestroy {
  employees$: Observable<Employee[]>;
  private destroy$ = new Subject<void>();

  constructor(private employeeService: EmployeeService) {
    this.employees$ = this.employeeService.employees$
      .pipe(
        tap(employees => console.debug('Initial employees:', employees)),
        takeUntil(this.destroy$)
      );
  }

  /*
  * If departmentId is null or undefined, fetch unassigned employees.
  * If departmentId is a number, fetch employees of that department.
  * */
  @Input()
  set employees(departmentId: number | null | undefined) {
    console.debug('Setting employees:', departmentId);
    if (departmentId == null) {
      this.employees$ = this.employeeService.getUnassignedEmployees()
        .pipe(
          tap(employees => console.log('Unassigned employees:', employees)),
          takeUntil(this.destroy$)
        );
    } else {
      this.employees$ = this.employeeService.getEmployeesByDepartment(departmentId)
        .pipe(
          tap(employees => console.log(`Employees for department ${departmentId}:`, employees)),
          takeUntil(this.destroy$)
        );
    }
  }

  ngOnInit(): void {
    console.debug('EmployeeComponent initialized');
  }

  ngOnDestroy(): void {
    console.debug('EmployeeComponent destroying');
    this.destroy$.next();
    this.destroy$.complete();
  }
}
