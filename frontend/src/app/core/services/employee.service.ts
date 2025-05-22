import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private employees: Employee[] = [
    { id: 'e1', fullName: 'Alice Wonderland', address: '123 Main St', phoneNumber: '555-1234', email: 'alice@example.com', departmentId: 'd1' },
    { id: 'e2', fullName: 'Bob The Builder', address: '456 Side St', phoneNumber: '555-5678', email: 'bob@example.com', departmentId: 'd2' },
    { id: 'e3', fullName: 'Charlie Brown', address: '789 Other St', phoneNumber: '555-9012', email: 'charlie@example.com', departmentId: 'd1' },
    { id: 'e4', fullName: 'Diana Prince', address: '101 Hero Ave', phoneNumber: '555-3456', email: 'diana@example.com', departmentId: 'd2' },
    { id: 'e5', fullName: 'Edward Scissorhands', address: '202 Cut St', phoneNumber: '555-7890', email: 'edward@example.com', departmentId: null }, // Unassigned
  ];

  constructor() { }

  getEmployees(departmentId?: string | null): Observable<Employee[]> {
    if (departmentId === undefined) { // Get all employees
        return of(this.employees);
    }
    return of(this.employees.filter(e => e.departmentId === departmentId));
  }

  getEmployeeById(id: string): Observable<Employee | undefined> {
    return of(this.employees.find(e => e.id === id));
  }
  
  searchEmployeesByName(searchTerm: string): Observable<Employee[]> {
    if (!searchTerm.trim()) {
      return of([]);
    }
    return of(
      this.employees.filter(employee =>
        employee.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }

  addEmployee(employeeData: Omit<Employee, 'id'>): Observable<Employee> {
    const newEmployee: Employee = {
      id: `e${this.employees.length + 1}`, // Simple ID generation
      ...employeeData
    };
    this.employees.push(newEmployee);
    return of(newEmployee);
  }

  deleteEmployee(employeeId: string): Observable<void> {
    this.employees = this.employees.filter(e => e.id !== employeeId);
    return of(undefined);
  }

  // Helper to update departmentId of employees when a department is deleted
  assignEmployeesToDepartment(employeeIds: string[], newDepartmentId: string | null): Observable<void> {
    this.employees = this.employees.map(emp =>
      employeeIds.includes(emp.id) ? { ...emp, departmentId: newDepartmentId } : emp
    );
    return of(undefined);
  }
}
