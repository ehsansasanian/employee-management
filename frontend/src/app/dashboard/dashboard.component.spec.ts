import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { DashboardComponent, UNASSIGNED_DEPARTMENT_NAME } from './dashboard.component';
import { DepartmentService } from '../core/services/department.service';
import { EmployeeService } from '../core/services/employee.service';
import { Department } from '../core/models/department.model';
import { Employee } from '../core/models/employee.model';
import { AppRoutingModule } from '../app-routing.module'; // For routerLinkActive, etc.
import { HttpClientModule } from '@angular/common/http'; // Often needed

// Mock services
class MockDepartmentService {
  getDepartments() {
    return of([
      { id: 'd1', name: 'HR', employeeCount: 1 },
      { id: 'd2', name: 'Engineering', employeeCount: 1 }
    ]);
  }
  addDepartment(name: string) { return of({ id: 'd3', name: name, employeeCount: 0 }); }
  deleteDepartment(id: string) { return of(undefined); }
  updateEmployeeCounts(departments: Department[], employees: Employee[]) { 
    // Simplified mock, real logic is in the service
    return departments.map(d => ({
        ...d,
        employeeCount: employees.filter(e => e.departmentId === d.id).length
    }));
  }
}

class MockEmployeeService {
  getEmployees(departmentId?: string | null) {
    const allEmployees: Employee[] = [
      { id: 'e1', fullName: 'Alice', departmentId: 'd1', email: '', address: '', phoneNumber: '' },
      { id: 'e2', fullName: 'Bob', departmentId: 'd2', email: '', address: '', phoneNumber: '' },
      { id: 'e3', fullName: 'Charlie (Unassigned)', departmentId: null, email: '', address: '', phoneNumber: '' }
    ];
    if (departmentId === undefined) return of(allEmployees);
    return of(allEmployees.filter(e => e.departmentId === departmentId));
  }
  searchEmployeesByName(term: string) {
    if (term === 'Alice') return of([{ id: 'e1', fullName: 'Alice', departmentId: 'd1', email: '', address: '', phoneNumber: '' }]);
    return of([]);
  }
  assignEmployeesToDepartment(employeeIds: string[], newDepartmentId: string | null) { return of(undefined); }
}

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let departmentService: DepartmentService;
  let employeeService: EmployeeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardComponent], // DepartmentDetailComponent removed as it's not directly used here
      imports: [
        FormsModule, 
        RouterTestingModule.withRoutes([]), // Basic router testing setup
        HttpClientModule // Common import
      ],
      providers: [
        { provide: DepartmentService, useClass: MockDepartmentService },
        { provide: EmployeeService, useClass: MockEmployeeService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    departmentService = TestBed.inject(DepartmentService);
    employeeService = TestBed.inject(EmployeeService);
    fixture.detectChanges(); // Trigger ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load departments and unassigned count on init', fakeAsync(() => {
    component.ngOnInit();
    tick(); // Simulate passage of time for async operations
    fixture.detectChanges();
    
    component.departments$.subscribe(depts => {
      expect(depts.length).toBe(3); // HR, Engineering, Unassigned
      const unassigned = depts.find(d => d.name === UNASSIGNED_DEPARTMENT_NAME);
      expect(unassigned).toBeTruthy();
      if (unassigned) { // Type guard
        expect(unassigned.employeeCount).toBe(1);
      }
    });
  }));

  it('should add a department', fakeAsync(() => {
    spyOn(departmentService, 'addDepartment').and.callThrough();
    spyOn(component, 'loadInitialData').and.callThrough();
    
    component.newDepartmentName = 'New Sales';
    component.onAddDepartment();
    tick();
    fixture.detectChanges();

    expect(departmentService.addDepartment).toHaveBeenCalledWith('New Sales');
    expect(component.loadInitialData).toHaveBeenCalled();
    expect(component.showAddDepartmentForm).toBeFalse();
  }));

  it('should delete a department and move employees', fakeAsync(() => {
    spyOn(departmentService, 'deleteDepartment').and.callThrough();
    spyOn(employeeService, 'assignEmployeesToDepartment').and.callThrough();
    spyOn(component, 'loadInitialData').and.callThrough();
    
    // Mock window.confirm to return true
    spyOn(window, 'confirm').and.returnValue(true);

    const deptIdToDelete = 'd1'; // HR
    component.onDeleteDepartment(deptIdToDelete);
    tick(); // for assignEmployeesToDepartment
    tick(); // for deleteDepartment
    tick(); // for loadInitialData
    fixture.detectChanges();

    expect(employeeService.assignEmployeesToDepartment).toHaveBeenCalled();
    expect(departmentService.deleteDepartment).toHaveBeenCalledWith(deptIdToDelete);
    expect(component.loadInitialData).toHaveBeenCalled();
  }));
  
  it('should search for employees', fakeAsync(() => {
    component.searchTerm = 'Alice';
    component.onSearchTermChange();
    tick();
    fixture.detectChanges();
    
    component.searchResults$.subscribe(results => {
        expect(results.length).toBe(1);
        expect(results[0].fullName).toBe('Alice');
    });
    expect(component.showSearchResults).toBeTrue();
  }));

  it('should clear search results for empty search term', fakeAsync(() => {
    component.searchTerm = ' ';
    component.onSearchTermChange();
    tick();
    fixture.detectChanges();
    
    component.searchResults$.subscribe(results => {
        expect(results.length).toBe(0);
    });
    expect(component.showSearchResults).toBeFalse();
  }));

});
