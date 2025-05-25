import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Observable, Subject, takeUntil, tap} from 'rxjs';
import {Employee, EmployeeRequestDTO} from '../models/employee.model';
import {EmployeeService} from '../services/employee.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {ErrorHandlerService} from '../services/error-handler-service';

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
  showAddModal = false;
  selectedEmployee: Employee | null = null;
  addEmployeeError: string | null = null;
  @ViewChild('modalDialog') modalDialog?: ElementRef<HTMLDivElement>;
  @ViewChild('addModalDialog') addModalDialog?: ElementRef<HTMLDivElement>;

  employeeForm: FormGroup;

  constructor(
    private employeeService: EmployeeService,
    private fb: FormBuilder,
    private errorHandlerService: ErrorHandlerService
  ) {
    this.employeeForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[+]?[0-9\\s-]{8,}$')]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      departmentId: [null]
    });
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
        next: () => {
          if (this._departmentId !== undefined) {
            // If we're in a department view, reload the page to refresh all data
            window.location.reload();
          } else {
            // If we're in the main employees view, just refresh the list
            this.loadEmployees();
          }
        },
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

  openAddModal(): void {
    this.showAddModal = true;
    this.employeeForm.reset();
    this.addEmployeeError = null;

    if (this._departmentId !== undefined && this._departmentId !== null) {
      this.employeeForm.patchValue({ departmentId: this._departmentId });
    }
    setTimeout(() => {
      this.addModalDialog?.nativeElement.focus();
    });
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.employeeForm.reset();
    this.addEmployeeError = null;
  }

  handleAddModalKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeAddModal();
    }
  }

  addEmployee(): void {
    if (this.employeeForm.valid) {
      this.addEmployeeError = null;
      const formValue = this.employeeForm.value;
      const request: EmployeeRequestDTO = {
        firstname: formValue.firstname,
        lastname: formValue.lastname,
        email: formValue.email,
        phone: formValue.phone,
        address: formValue.address,
        departmentId: formValue.departmentId || undefined
      };

      this.employeeService.addEmployee(request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.closeAddModal();
            if (this._departmentId !== undefined) {
              window.location.reload();
            } else {
              this.loadEmployees();
            }
          },
          error: (error: HttpErrorResponse) => this.addEmployeeError = this.errorHandlerService.getErrorMessage(error)
        });
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.employeeForm.get(controlName);
    if (!control) return '';

    if (control.hasError('required')) {
      return 'This field is required';
    }
    if (control.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control.hasError('minlength')) {
      return `Minimum length is ${control.errors?.['minlength'].requiredLength} characters`;
    }
    if (control.hasError('pattern')) {
      return 'Please enter a valid phone number';
    }
    return '';
  }
}
