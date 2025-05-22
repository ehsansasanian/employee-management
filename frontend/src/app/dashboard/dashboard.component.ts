import { Component, OnInit } from '@angular/core';
import { DepartmentService } from '../core/services/department.service';
import { EmployeeService } from '../core/services/employee.service';
import { Department } from '../core/models/department.model';
import { Employee } from '../core/models/employee.model';
import { Router } from '@angular/router'; // Import Router
import { Observable, forkJoin, of } from 'rxjs';
import { map, startWith, switchMap, tap } from 'rxjs/operators';

export const UNASSIGNED_DEPARTMENT_ID = null; // Or a special string like 'unassigned' if your backend uses that
export const UNASSIGNED_DEPARTMENT_NAME = 'Unassigned';

@Component({
  selector: 'app-dashboard', // Changed selector to be conventional 'app-dashboard'
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'] // Changed to styleUrls and .scss
})
export class DashboardComponent implements OnInit {
  departments$: Observable<Department[]> = of([]);
  allEmployees: Employee[] = []; // To calculate 'Unassigned' count

  // For adding a new department
  showAddDepartmentForm = false;
  newDepartmentName = '';

  // For employee search
  searchTerm = '';
  searchResults$: Observable<Employee[]> = of([]);
  showSearchResults = false;

  constructor(
    private departmentService: DepartmentService,
    private employeeService: EmployeeService,
    private router: Router // Inject Router
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.departments$ = forkJoin([
      this.departmentService.getDepartments(),
      this.employeeService.getEmployees() // Fetch all employees
    ]).pipe(
      map(([departments, employees]) => {
        this.allEmployees = employees;
        const unassignedCount = employees.filter(e => e.departmentId === UNASSIGNED_DEPARTMENT_ID).length;
        
        const departmentsWithCounts = this.departmentService.updateEmployeeCounts(departments, employees);

        if (unassignedCount > 0) {
          const unassignedDept: Department = {
            id: UNASSIGNED_DEPARTMENT_ID as any, // Use a specific ID or null for unassigned
            name: UNASSIGNED_DEPARTMENT_NAME,
            employeeCount: unassignedCount
          };
          // Avoid duplicating "Unassigned" if it's already returned by the service or added previously
          const existingUnassigned = departmentsWithCounts.find(d => d.id === UNASSIGNED_DEPARTMENT_ID || d.name === UNASSIGNED_DEPARTMENT_NAME);
          if (!existingUnassigned) {
            return [...departmentsWithCounts, unassignedDept];
          } else {
             existingUnassigned.employeeCount = unassignedCount; // Update count if it exists
             return departmentsWithCounts;
          }
        }
        // If no unassigned employees, remove "Unassigned" department if it was added synthetically
        // and is not a real department from the backend, unless no other departments exist.
        const unassignedPlaceholder = departmentsWithCounts.find(d => d.id === UNASSIGNED_DEPARTMENT_ID && d.name === UNASSIGNED_DEPARTMENT_NAME);
        if (unassignedPlaceholder && unassignedCount === 0) {
            const otherDepartmentsExist = departmentsWithCounts.some(d => d.id !== UNASSIGNED_DEPARTMENT_ID);
            if (otherDepartmentsExist) {
                return departmentsWithCounts.filter(d => d.id !== UNASSIGNED_DEPARTMENT_ID);
            } else {
                // If it's the only one, keep it but set count to 0
                unassignedPlaceholder.employeeCount = 0;
            }
        }
        return departmentsWithCounts;
      })
    );
  }

  toggleAddDepartmentForm(): void {
    this.showAddDepartmentForm = !this.showAddDepartmentForm;
    this.newDepartmentName = ''; // Reset name
  }

  onAddDepartment(): void {
    if (this.newDepartmentName.trim()) {
      this.departmentService.addDepartment(this.newDepartmentName.trim()).subscribe(() => {
        this.loadInitialData(); // Reload data
        this.toggleAddDepartmentForm(); // Hide form
      });
    }
  }

  onDeleteDepartment(departmentId: string): void {
    if (confirm('Are you sure you want to delete this department? Employees will be moved to Unassigned.')) {
      // Get employees from the department to be deleted
      this.employeeService.getEmployees(departmentId).pipe(
        switchMap(employeesToMove => {
          const employeeIdsToMove = employeesToMove.map(emp => emp.id);
          if (employeeIdsToMove.length > 0) {
            return this.employeeService.assignEmployeesToDepartment(employeeIdsToMove, UNASSIGNED_DEPARTMENT_ID);
          }
          return of(undefined); // No employees to move
        }),
        switchMap(() => this.departmentService.deleteDepartment(departmentId))
      ).subscribe(() => {
        this.loadInitialData(); // Reload data
      });
    }
  }

  onSearchTermChange(): void {
    if (this.searchTerm.trim()) {
      this.showSearchResults = true;
      this.searchResults$ = this.employeeService.searchEmployeesByName(this.searchTerm.trim()).pipe(
        // Optionally, enrich with department name if not already part of Employee model from service
        // For now, assuming Employee model might not have departmentName directly
        // This could be improved by having searchEmployeesByName return enriched data
        // or by doing a secondary lookup here (less efficient for lists)
      );
    } else {
      this.showSearchResults = false;
      this.searchResults$ = of([]);
    }
  }
  
  navigateToDepartment(departmentId: string | null): void {
    if (departmentId === UNASSIGNED_DEPARTMENT_ID) {
      // Potentially navigate to a special view for unassigned or handle differently
      // For now, let's assume we navigate to a route that can handle 'null' or a special ID
      this.router.navigate(['/department', 'unassigned']);
    } else {
      this.router.navigate(['/department', departmentId]);
    }
  }

  // Method to get department name for search results (if needed)
  // This is a placeholder if your Employee model doesn't include departmentName
  // A better approach is to have the service return this or use a combined observable
  getDepartmentNameForEmployee(departmentId: string | null, departments: Department[] | null): string {
    if (!departmentId) return UNASSIGNED_DEPARTMENT_NAME;
    if (!departments) return 'Loading...'; // Or handle as error/unknown
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : UNASSIGNED_DEPARTMENT_NAME;
  }
}
