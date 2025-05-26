import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core'
import {Department} from '../models/department.model'
import {DepartmentService, NewDepartment} from '../services/department.service'
import {EmployeeService} from '../services/employee.service'
import {Observable, Subject, takeUntil} from 'rxjs'
import {ErrorHandlerService} from '../services/error-handler-service'
import {SearchService} from '../services/search.service'
import {debounceTime, filter} from 'rxjs/operators'

@Component({
  selector: 'dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  departments$: Observable<Department[]>

  activeTab: 'departments' | 'employees' = 'departments'
  addDepartmentError: string | null = null

  showAddModal = false
  showEmployeeModal = false

  newDepartmentName: string = ''
  selectedDepartment: Department | null = null
  unassignedCount: number = 0
  @ViewChild('addDeptInput') addDeptInputRef?: ElementRef<HTMLInputElement>

  private destroy$ = new Subject<void>()

  constructor(private departmentService: DepartmentService,
              private employeeService: EmployeeService,
              private errorHandlerService: ErrorHandlerService,
              private searchService: SearchService) {
    this.departments$ = this.departmentService.departments$
  }

  ngOnInit(): void {
    this.employeeService.getUnassignedEmployeeCount()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (count) => this.unassignedCount = count,
        error: (error) => console.error('Error getting unassigned count:', error)
      })
    this.subscribeToSearch()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  /*       Department management methods      */

  openAddModal(): void {
    this.showAddModal = true
    this.newDepartmentName = ''
    this.addDepartmentError = null
    setTimeout(() => {
      this.addDeptInputRef?.nativeElement.focus()
    })
  }

  closeAddModal(): void {
    this.showAddModal = false
    this.newDepartmentName = ''
    this.addDepartmentError = null
  }

  handleAddModalKey(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.addDepartment()
    } else if (event.key === 'Escape') {
      this.closeAddModal()
    }
  }

  addDepartment(): void {
    const name = this.newDepartmentName.trim()
    if (!name) return
    const newDepartment: NewDepartment = {
      name,
      employeeCount: 0
    }
    this.addDepartmentError = null
    this.departmentService.addDepartment(newDepartment)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.closeAddModal(),
        error: (error) => this.addDepartmentError = this.errorHandlerService.getErrorMessage(error)
      })
  }

  deleteDepartment(id: number): void {
    this.departmentService.deleteDepartment(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (error) => console.error('Error deleting department:', error)
      })
  }

  /*          Employee management methods        */

  openEmployeeModal(department: Department): void {
    this.selectedDepartment = department
    this.showEmployeeModal = true
    setTimeout(() => {
      const modal = document.getElementById('employee-modal')
      modal?.focus()
    })
  }

  closeEmployeeModal(): void {
    this.showEmployeeModal = false
    this.selectedDepartment = null
  }

  handleEmployeeModalKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeEmployeeModal()
    }
  }

  openUnassignedModal(): void {
    this.selectedDepartment = null
    this.showEmployeeModal = true
    setTimeout(() => {
      const modal = document.getElementById('employee-modal')
      modal?.focus()
    })
  }

  private subscribeToSearch() {
    this.searchService.search$
      .pipe(
        debounceTime(400),
        filter(value => value !== undefined && value !== null),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        if (this.activeTab === 'departments') {
          if (value && value.trim() !== '') {
            this.departments$ = this.departmentService.searchDepartments(value.trim())
          } else {
            this.departments$ = this.departmentService.departments$
          }
        }
      })
  }
}
