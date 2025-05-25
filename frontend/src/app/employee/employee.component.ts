import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
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

  showDetailsModal = false;
  selectedEmployee: Employee | null = null;
  @ViewChild('modalDialog') modalDialog?: ElementRef<HTMLDivElement>;

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

  deleteEmployee(id: number, event: Event): void {
    event.stopPropagation();
    this.employeeService.deleteEmployee(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (error) => console.error('Error deleting employee:', error)
      });
  }

  openDetailsModal(employee: Employee, event: Event): void {
    event.stopPropagation();
    this.selectedEmployee = employee;
    this.showDetailsModal = true;
    setTimeout(() => {
      this.modalDialog?.nativeElement.focus();
    });
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedEmployee = null;
  }

  handleModalKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeDetailsModal();
    }
  }
}
