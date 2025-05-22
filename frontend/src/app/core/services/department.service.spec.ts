import { TestBed } from '@angular/core/testing';
import { DepartmentService } from './department.service';
import { Department } from '../models/department.model';
import { Employee } from '../models/employee.model'; // Needed for updateEmployeeCounts

describe('DepartmentService', () => {
  let service: DepartmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DepartmentService);
    // Reset mock data for each test if necessary (depends on service design)
    // For this service, new instance means fresh data as it's in the class property.
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return initial departments', (done: DoneFn) => {
    service.getDepartments().subscribe(departments => {
      expect(departments.length).toBe(3);
      expect(departments[0].name).toBe('Human Resources');
      done();
    });
  });

  it('should add a new department', (done: DoneFn) => {
    const newDeptName = 'Quality Assurance';
    service.addDepartment(newDeptName).subscribe(newDepartment => {
      expect(newDepartment.name).toBe(newDeptName);
      expect(newDepartment.employeeCount).toBe(0);
      service.getDepartments().subscribe(departments => {
        expect(departments.length).toBe(4);
        expect(departments.find(d => d.name === newDeptName)).toBeTruthy();
        done();
      });
    });
  });

  it('should delete a department', (done: DoneFn) => {
    const deptToDeleteId = 'd1'; // ID for 'Human Resources'
    service.deleteDepartment(deptToDeleteId).subscribe(() => {
      service.getDepartments().subscribe(departments => {
        expect(departments.length).toBe(2);
        expect(departments.find(d => d.id === deptToDeleteId)).toBeFalsy();
        done();
      });
    });
  });
  
  it('should update employee counts correctly', () => {
    const mockDepartments: Department[] = [
      { id: 'd1', name: 'HR', employeeCount: 0 },
      { id: 'd2', name: 'Engineering', employeeCount: 0 },
    ];
    const mockEmployees: Employee[] = [
      { id: 'e1', fullName: 'Emp1', departmentId: 'd1', email: '', address: '', phoneNumber: '' },
      { id: 'e2', fullName: 'Emp2', departmentId: 'd2', email: '', address: '', phoneNumber: '' },
      { id: 'e3', fullName: 'Emp3', departmentId: 'd1', email: '', address: '', phoneNumber: '' },
      { id: 'e4', fullName: 'Emp4', departmentId: null, email: '', address: '', phoneNumber: '' }, // Unassigned
    ];

    const updatedDepartments = service.updateEmployeeCounts(mockDepartments, mockEmployees);
    
    const hrDept = updatedDepartments.find(d => d.id === 'd1');
    const engDept = updatedDepartments.find(d => d.id === 'd2');

    expect(hrDept?.employeeCount).toBe(2);
    expect(engDept?.employeeCount).toBe(1);
  });
});
