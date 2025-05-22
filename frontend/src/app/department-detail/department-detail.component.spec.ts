import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { DepartmentDetailComponent } from './department-detail.component';
import { DepartmentService } from '../core/services/department.service';
import { EmployeeService } from '../core/services/employee.service';
import { Department } from '../core/models/department.model';
import { Employee } from '../core/models/employee.model';
import { HttpClientModule } from '@angular/common/http';

// Mock services (can be shared or simplified if complex)
class MockDepartmentService {
  getDepartments() { 
    return of([
      { id: 'd1', name: 'HR', employeeCount: 1 },
      { id: 'd2', name: 'Engineering', employeeCount: 0 }
    ]); 
  }
  // getDepartmentById(id: string) might be more realistic for this component's actual use
  // For the current component implementation, getDepartments() and then finding the dept is used.
  // And updateEmployeeCounts is also used indirectly by the component when refreshing department data.
   updateEmployeeCounts(departments: Department[], employees: Employee[]): Department[] {
    return departments.map(dept => ({
      ...dept,
      employeeCount: employees.filter(e => e.departmentId === dept.id).length
    }));
  }
}

class MockEmployeeService {
  getEmployees(departmentId?: string | null) {
    const allEmployees: Employee[] = [ // Added a more complete list for comprehensive testing
        { id: 'e1', fullName: 'Alice Smith', departmentId: 'd1', email: 'alice@example.com', phoneNumber: '111', address: 'Addr1' },
        { id: 'e2', fullName: 'Bob Johnson', departmentId: 'd2', email: 'bob@example.com', phoneNumber: '222', address: 'Addr2' },
        { id: 'e3', fullName: 'Charlie (Unassigned)', departmentId: null, email: 'charlie@example.com', phoneNumber: '333', address: 'Addr3' },
        { id: 'e4', fullName: 'Alan Wake', departmentId: 'd1', email: 'alan@example.com', phoneNumber: '444', address: 'Addr4' }
    ];

    if (departmentId === undefined) return of(allEmployees);
    return of(allEmployees.filter(e => e.departmentId === departmentId));
  }
  getEmployeeById(id: string) { 
    const allEmployees: Employee[] = [
        { id: 'e1', fullName: 'Alice Smith', departmentId: 'd1', email: 'alice@example.com', phoneNumber: '111', address: 'Addr1' },
        { id: 'e3', fullName: 'Charlie (Unassigned)', departmentId: null, email: 'charlie@example.com', phoneNumber: '333', address: 'Addr3' }
    ];
    return of(allEmployees.find(e => e.id === id));
  }
  addEmployee(employee: Omit<Employee, 'id'>) { 
    return of({ ...employee, id: 'eNew' } as Employee); 
  }
  deleteEmployee(id: string) { return of(undefined); }
}

describe('DepartmentDetailComponent', () => {
  let component: DepartmentDetailComponent;
  let fixture: ComponentFixture<DepartmentDetailComponent>;
  let employeeService: EmployeeService;
  let departmentService: DepartmentService; 
  let router: Router;


  const mockActivatedRoute = {
    paramMap: of(convertToParamMap({ id: 'd1' })) // Default to a valid department
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DepartmentDetailComponent],
      imports: [FormsModule, RouterTestingModule.withRoutes([]), HttpClientModule],
      providers: [
        { provide: DepartmentService, useClass: MockDepartmentService },
        { provide: EmployeeService, useClass: MockEmployeeService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DepartmentDetailComponent);
    component = fixture.componentInstance;
    employeeService = TestBed.inject(EmployeeService);
    departmentService = TestBed.inject(DepartmentService); 
    router = TestBed.inject(Router); 
    // fixture.detectChanges(); // ngOnInit is complex, call manually in tests or after setup
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load department and employees on init for a specific department ID', fakeAsync(() => {
    mockActivatedRoute.paramMap = of(convertToParamMap({ id: 'd1' })); 
    fixture.detectChanges(); // Trigger ngOnInit
    tick(); 
    
    expect(component.department).toBeTruthy();
    if(component.department) { 
      expect(component.department.id).toBe('d1');
      expect(component.department.name).toBe('HR');
    }
    
    component.employees$.subscribe(employees => {
      // MockEmployeeService now returns Alice Smith and Alan Wake for d1
      expect(employees.length).toBe(2); 
      expect(employees.find(e=>e.fullName === 'Alice Smith')).toBeTruthy();
      expect(employees.find(e=>e.fullName === 'Alan Wake')).toBeTruthy();
    });
  }));
  
  it('should load "Unassigned" department and its employees when id is "unassigned"', fakeAsync(() => {
    mockActivatedRoute.paramMap = of(convertToParamMap({ id: 'unassigned' }));
    fixture.detectChanges(); 
    tick();

    expect(component.department).toBeTruthy();
    if (component.department) {
        expect(component.department.name).toBe('Unassigned');
    }
    component.employees$.subscribe(employees => {
        expect(employees.length).toBe(1); 
        expect(employees[0].fullName).toBe('Charlie (Unassigned)');
        expect(employees[0].departmentId).toBeNull();
    });
  }));


  it('should add an employee to the current department', fakeAsync(() => {
    mockActivatedRoute.paramMap = of(convertToParamMap({ id: 'd1' }));
    fixture.detectChanges(); 
    tick();

    spyOn(employeeService, 'addEmployee').and.callThrough();
    spyOn(component, 'loadEmployees').and.callThrough();


    component.newEmployee = { fullName: 'New Guy', email: 'new@test.com', phoneNumber: '123', address: 'Addr' };
    component.onAddEmployee();
    tick(); 
    tick(); 

    expect(employeeService.addEmployee).toHaveBeenCalledWith(jasmine.objectContaining({ fullName: 'New Guy', departmentId: 'd1' }));
    // ngOnInit calls loadEmployees once. onAddEmployee calls it again.
    expect(component.loadEmployees).toHaveBeenCalledTimes(2); 
    expect(component.showAddEmployeeForm).toBeFalse();
  }));

  it('should delete an employee', fakeAsync(() => {
    mockActivatedRoute.paramMap = of(convertToParamMap({ id: 'd1' }));
    fixture.detectChanges(); 
    tick();

    spyOn(employeeService, 'deleteEmployee').and.callThrough();
    spyOn(component, 'loadEmployees').and.callThrough();
    spyOn(window, 'confirm').and.returnValue(true);

    const employeeIdToDelete = 'e1'; 
    component.onDeleteEmployee(employeeIdToDelete);
    tick(); 
    tick(); 

    expect(employeeService.deleteEmployee).toHaveBeenCalledWith(employeeIdToDelete);
    // ngOnInit calls loadEmployees once. onDeleteEmployee calls it again.
    expect(component.loadEmployees).toHaveBeenCalledTimes(2); 
  }));
  
  it('should filter employees based on search term', fakeAsync(() => {
    mockActivatedRoute.paramMap = of(convertToParamMap({ id: 'd1' })); 
    
    // Spy on the actual service method to control its output for this test
    const mockDeptEmployees = [
        { id: 'e1', fullName: 'Alice Smith', departmentId: 'd1', email: '', address: '', phoneNumber: '' },
        { id: 'e4', fullName: 'Alan Wake', departmentId: 'd1', email: '', address: '', phoneNumber: '' }
    ];
    spyOn(employeeService, 'getEmployees').and.returnValue(of(mockDeptEmployees));
    
    fixture.detectChanges(); 
    tick(); 

    component.searchTerm = 'Alice';
    component.onSearchTermChange(); // This calls loadEmployees again with the new term
    tick(); 

    component.employees$.subscribe(employees => {
      expect(employees.length).toBe(1);
      expect(employees[0].fullName).toBe('Alice Smith');
    });
  }));
  
  it('should navigate to dashboard on goBackToDashboard', () => {
    spyOn(router, 'navigate');
    component.goBackToDashboard();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

}));
