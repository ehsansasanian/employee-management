import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DepartmentService } from '../core/services/department.service';
import { EmployeeService } from '../core/services/employee.service';
import { Department } from '../core/models/department.model';
import { Employee } from '../core/models/employee.model';
import { Observable, of, forkJoin } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { UNASSIGNED_DEPARTMENT_ID, UNASSIGNED_DEPARTMENT_NAME } from '../dashboard/dashboard.component'; // Import constants

@Component({
  selector: 'app-department-detail',
  templateUrl: './department-detail.component.html',
  styleUrls: ['./department-detail.component.scss']
})
export class DepartmentDetailComponent implements OnInit {
  department: Department | null = null;
  employees$: Observable<Employee[]> = of([]);
  departmentId: string | null = null;

  // For adding a new employee
  showAddEmployeeForm = false;
  newEmployee: Omit<Employee, 'id' | 'departmentId'> = {
    fullName: '',
    email: '',
    phoneNumber: '',
    address: ''
  };

  // For searching employees within the department
  searchTerm = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private departmentService: DepartmentService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        this.departmentId = id === 'unassigned' ? UNASSIGNED_DEPARTMENT_ID : id;
        
        let departmentObs: Observable<Department | undefined | null>;

        if (this.departmentId === UNASSIGNED_DEPARTMENT_ID) {
          // Create a synthetic "Unassigned" department object
          // We need all employees to correctly count for the unassigned department here
          departmentObs = this.employeeService.getEmployees(UNASSIGNED_DEPARTMENT_ID).pipe(
            map(unassignedEmployees => ({
              id: UNASSIGNED_DEPARTMENT_ID as any,
              name: UNASSIGNED_DEPARTMENT_NAME,
              employeeCount: unassignedEmployees.length
            }))
          );
        } else if (this.departmentId) {
          // Fetch the specific department and all employees to correctly calculate its count
          departmentObs = forkJoin([
            this.departmentService.getDepartments(), // In a real app, you'd fetch by ID: this.departmentService.getDepartmentById(this.departmentId)
            this.employeeService.getEmployees() 
          ]).pipe(
            map(([departments, allEmployees]) => {
              const currentDept = departments.find(d => d.id === this.departmentId);
              if (currentDept) {
                return {
                  ...currentDept,
                  employeeCount: allEmployees.filter(e => e.departmentId === this.departmentId).length
                };
              }
              return undefined; // Department not found
            })
          );
        } else {
          return of(null); // No ID, should not happen with proper routing
        }
        return departmentObs;
      }),
      tap(department => {
        if (department) {
          this.department = department;
          this.loadEmployees();
        } else {
          // Handle department not found, e.g., navigate to a 404 page or dashboard
          this.router.navigate(['/dashboard']);
        }
      })
    ).subscribe();
  }

  loadEmployees(): void {
    this.employees$ = this.employeeService.getEmployees(this.departmentId).pipe(
      map(employees => {
        if (!this.searchTerm.trim()) {
          return employees;
        }
        return employees.filter(e => e.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()));
      })
    );
  }

  onSearchTermChange(): void {
    this.loadEmployees(); // Reload employees with the current search term
  }

  toggleAddEmployeeForm(): void {
    this.showAddEmployeeForm = !this.showAddEmployeeForm;
    this.newEmployee = { fullName: '', email: '', phoneNumber: '', address: '' }; // Reset form
  }

  onAddEmployee(): void {
    if (this.newEmployee.fullName.trim() && this.newEmployee.email.trim()) { // Basic validation
      const employeeToAdd: Omit<Employee, 'id'> = {
        ...this.newEmployee,
        departmentId: this.departmentId 
      };
      this.employeeService.addEmployee(employeeToAdd).subscribe(() => {
        this.loadEmployees(); // Refresh employee list
        // This is to refresh the count on the department object after adding employee
        if (this.department) { // Check if department is not null
          if (this.departmentId === UNASSIGNED_DEPARTMENT_ID) {
            this.employeeService.getEmployees(UNASSIGNED_DEPARTMENT_ID).subscribe(emps => {
               if(this.department) this.department.employeeCount = emps.length;
            });
          } else {
            // For regular departments, refetch all departments to update counts
            // This is inefficient for mock services but simulates a refresh.
            // A better mock service would update counts internally or return the updated department.
            this.departmentService.getDepartments().pipe(
                switchMap(departments => this.employeeService.getEmployees().pipe(
                    map(allEmployees => this.departmentService.updateEmployeeCounts(departments, allEmployees))
                )),
                map(updatedDepartments => updatedDepartments.find(d => d.id === this.departmentId))
            ).subscribe(updatedDeptData => {
                if (this.department && updatedDeptData) {
                    this.department.employeeCount = updatedDeptData.employeeCount;
                }
            });
          }
        }
        this.toggleAddEmployeeForm();
      });
    }
  }

  onDeleteEmployee(employeeId: string): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(employeeId).subscribe(() => {
        this.loadEmployees(); // Refresh employee list
         // This is to refresh the count on the department object after deleting employee
        if (this.department) { // Check if department is not null
          if (this.departmentId === UNASSIGNED_DEPARTMENT_ID) {
             this.employeeService.getEmployees(UNASSIGNED_DEPARTMENT_ID).subscribe(emps => {
                if(this.department) this.department.employeeCount = emps.length;
             });
          } else {
            // Similar to addEmployee, refresh counts
            this.departmentService.getDepartments().pipe(
                switchMap(departments => this.employeeService.getEmployees().pipe(
                    map(allEmployees => this.departmentService.updateEmployeeCounts(departments, allEmployees))
                )),
                map(updatedDepartments => updatedDepartments.find(d => d.id === this.departmentId))
            ).subscribe(updatedDeptData => {
                if (this.department && updatedDeptData) {
                    this.department.employeeCount = updatedDeptData.employeeCount;
                }
            });
          }
        }
      });
    }
  }
  
  goBackToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
