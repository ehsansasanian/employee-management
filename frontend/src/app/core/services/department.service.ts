import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Department } from '../models/department.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private departments: Department[] = [
    { id: 'd1', name: 'Human Resources', employeeCount: 5 },
    { id: 'd2', name: 'Engineering', employeeCount: 12 },
    { id: 'd3', name: 'Marketing', employeeCount: 8 }
  ];

  constructor() { }

  getDepartments(): Observable<Department[]> {
    return of(this.departments);
  }

  addDepartment(departmentName: string): Observable<Department> {
    const newDepartment: Department = {
      id: `d${this.departments.length + 1}`, // Simple ID generation
      name: departmentName,
      employeeCount: 0
    };
    this.departments.push(newDepartment);
    return of(newDepartment);
  }

  deleteDepartment(departmentId: string): Observable<void> {
    this.departments = this.departments.filter(d => d.id !== departmentId);
    // Note: Logic to move employees to "Unassigned" will be handled
    // in the component or a higher-level service for now.
    return of(undefined);
  }

  // Mock method to update employee counts, real implementation might differ
  updateEmployeeCounts(departments: Department[], employees: any[]): Department[] {
    const counts = new Map<string | null, number>();
    employees.forEach(emp => {
      counts.set(emp.departmentId, (counts.get(emp.departmentId) || 0) + 1);
    });

    return departments.map(dept => ({
      ...dept,
      employeeCount: counts.get(dept.id) || 0
    }));
  }
}
