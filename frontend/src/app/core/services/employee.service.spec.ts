import { TestBed } from '@angular/core/testing';
import { EmployeeService } from './employee.service';
import { Employee } from '../models/employee.model';

describe('EmployeeService', () => {
  let service: EmployeeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return all employees if no departmentId is provided', (done: DoneFn) => {
    service.getEmployees().subscribe(employees => {
      expect(employees.length).toBe(5); // Initial mock count
      done();
    });
  });

  it('should return employees for a specific departmentId', (done: DoneFn) => {
    const hrDepartmentId = 'd1';
    service.getEmployees(hrDepartmentId).subscribe(employees => {
      expect(employees.length).toBe(2); // Alice, Charlie
      expect(employees.every(e => e.departmentId === hrDepartmentId)).toBeTrue();
      done();
    });
  });
  
  it('should return unassigned employees if departmentId is null', (done: DoneFn) => {
    service.getEmployees(null).subscribe(employees => {
      expect(employees.length).toBe(1); // Edward Scissorhands
      expect(employees.every(e => e.departmentId === null)).toBeTrue();
      done();
    });
  });

  it('should add a new employee', (done: DoneFn) => {
    const newEmployeeData: Omit<Employee, 'id'> = {
      fullName: 'Test Employee',
      email: 'test@example.com',
      phoneNumber: '123-456-7890',
      address: '1 Test Lane',
      departmentId: 'd2'
    };
    service.addEmployee(newEmployeeData).subscribe(newEmployee => {
      expect(newEmployee.fullName).toBe(newEmployeeData.fullName);
      expect(newEmployee.id).toBeDefined();
      service.getEmployees().subscribe(employees => {
        expect(employees.length).toBe(6);
        expect(employees.find(e => e.fullName === newEmployeeData.fullName)).toBeTruthy();
        done();
      });
    });
  });

  it('should delete an employee', (done: DoneFn) => {
    const employeeToDeleteId = 'e1'; // Alice Wonderland
    service.deleteEmployee(employeeToDeleteId).subscribe(() => {
      service.getEmployees().subscribe(employees => {
        expect(employees.length).toBe(4);
        expect(employees.find(e => e.id === employeeToDeleteId)).toBeFalsy();
        done();
      });
    });
  });

  it('should assign employees to a new department', (done: DoneFn) => {
    const employeesToMoveIds = ['e1', 'e3']; // Alice and Charlie, both in d1
    const targetDepartmentId = 'd2';
    service.assignEmployeesToDepartment(employeesToMoveIds, targetDepartmentId).subscribe(() => {
      service.getEmployeeById('e1').subscribe(emp1 => {
        expect(emp1?.departmentId).toBe(targetDepartmentId);
      });
      service.getEmployeeById('e3').subscribe(emp3 => {
        expect(emp3?.departmentId).toBe(targetDepartmentId);
        done();
      });
    });
  });
  
  it('should search employees by name (case-insensitive)', (done: DoneFn) => {
    service.searchEmployeesByName('alice').subscribe(employees => {
      expect(employees.length).toBe(1);
      expect(employees[0].fullName).toBe('Alice Wonderland');
      done();
    });
  });

  it('should return empty array for search term with no matches', (done: DoneFn) => {
    service.searchEmployeesByName('NonExistentName').subscribe(employees => {
      expect(employees.length).toBe(0);
      done();
    });
  });

  it('should return empty array for empty search term', (done: DoneFn) => {
    service.searchEmployeesByName('   ').subscribe(employees => {
      expect(employees.length).toBe(0);
      done();
    });
  });
});
