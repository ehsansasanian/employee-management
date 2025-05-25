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
  employees$!: Observable<Employee[]>;
  private _departmentId: number | null | undefined = undefined;
  private destroy$ = new Subject<void>()

  constructor(private employeeService: EmployeeService) {
  }

  @Input()
  set departmentId(value: number | null | undefined) {
    this._departmentId = value;
    this.loadEmployees();
  }

  get departmentId(): number | null | undefined {
    return this._departmentId;
  }

  private loadEmployees(): void {
    if (this._departmentId === undefined) {
      // 'Employees' tab, load all paginated
      this.employees$ = this.employeeService.getEmployeesPaginated()
        .pipe(
          tap(employees => console.info('Paginated employees:', employees)),
          takeUntil(this.destroy$)
        );
    } else if (this._departmentId === null) {
      // 'Unassigned' card
      this.employees$ = this.employeeService.getUnassignedEmployees()
        .pipe(
          tap(employees => console.info('Unassigned employees:', employees)),
          takeUntil(this.destroy$)
        );
    } else {
      // specific department card
      this.employees$ = this.employeeService.getEmployeesByDepartment(this._departmentId)
        .pipe(
          tap(employees => console.info(`Employees for department ${this._departmentId}:`, employees)),
          takeUntil(this.destroy$)
        );
    }
  }

  ngOnInit(): void {
    // Only use onInit for the `employees` tab
    if (this._departmentId === undefined) {
      console.info('EmployeeComponent, loading paginated employees');
      this.loadEmployees();
    }
  }

  ngOnDestroy(): void {
    console.debug('EmployeeComponent destroying');
    this.destroy$.next();
    this.destroy$.complete();
  }
}
