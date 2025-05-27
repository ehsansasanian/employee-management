import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing'
import {EmployeeComponent} from './employee.component'
import {FormBuilder, ReactiveFormsModule} from '@angular/forms'
import {EmployeeService} from '../services/employee.service'
import {ErrorHandlerService} from '../services/error-handler-service'
import {SearchService} from '../services/search.service'
import {of, throwError} from 'rxjs'
import {HttpErrorResponse} from '@angular/common/http'
import {Employee} from '../models/employee.model'

describe('EmployeeComponent', () => {
  let component: EmployeeComponent
  let fixture: ComponentFixture<EmployeeComponent>
  let employeeServiceSpy: jasmine.SpyObj<EmployeeService>
  let errorHandlerServiceSpy: jasmine.SpyObj<ErrorHandlerService>
  let searchServiceSpy: jasmine.SpyObj<SearchService>

  const mockEmployee: Employee = {
    id: 1,
    fullName: 'test Doe',
    email: 'test@example.com',
    phone: '1234567890',
    address: '123 Main St',
    department: null
  }

  beforeEach(async () => {
    employeeServiceSpy = jasmine.createSpyObj('EmployeeService', ['addEmployee', 'getEmployeesPaginated'])
    errorHandlerServiceSpy = jasmine.createSpyObj('ErrorHandlerService', ['getErrorMessage'])
    searchServiceSpy = jasmine.createSpyObj('SearchService', [], {
      search$: of('')
    })

    // Configure default spy behaviors
    employeeServiceSpy.getEmployeesPaginated.and.returnValue(of([]))

    await TestBed.configureTestingModule({
      declarations: [EmployeeComponent],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: EmployeeService, useValue: employeeServiceSpy },
        { provide: ErrorHandlerService, useValue: errorHandlerServiceSpy },
        { provide: SearchService, useValue: searchServiceSpy }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(EmployeeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('Add Employee Form', () => {
    it('should initialize with empty form', () => {
      expect(component.employeeForm.get('firstname')?.value).toBe('')
      expect(component.employeeForm.get('lastname')?.value).toBe('')
      expect(component.employeeForm.get('email')?.value).toBe('')
      expect(component.employeeForm.get('phone')?.value).toBe('')
      expect(component.employeeForm.get('address')?.value).toBe('')
      expect(component.employeeForm.get('departmentId')?.value).toBe(null)
    })

    it('should validate required fields', () => {
      const form = component.employeeForm
      expect(form.valid).toBeFalsy()
      expect(form.get('firstname')?.errors?.['required']).toBeTruthy()
      expect(form.get('lastname')?.errors?.['required']).toBeTruthy()
      expect(form.get('email')?.errors?.['required']).toBeTruthy()
      expect(form.get('phone')?.errors?.['required']).toBeTruthy()
      expect(form.get('address')?.errors?.['required']).toBeTruthy()
    })

    it('should validate email format', () => {
      const emailControl = component.employeeForm.get('email')
      emailControl?.setValue('invalid-email')
      expect(emailControl?.errors?.['email']).toBeTruthy()

      emailControl?.setValue('valid@email.com')
      expect(emailControl?.errors?.['email']).toBeFalsy()
    })

    it('should validate phone number format', () => {
      const phoneControl = component.employeeForm.get('phone')
      phoneControl?.setValue('123') // Too short
      expect(phoneControl?.errors?.['pattern']).toBeTruthy()

      phoneControl?.setValue('1234567890')
      expect(phoneControl?.errors?.['pattern']).toBeFalsy()
    })
  })

  describe('Add Employee Modal', () => {
    it('should open add modal and reset form', () => {
      component.openAddModal()
      expect(component.showAddModal).toBeTrue()
      expect(component.addEmployeeError).toBeNull()
      expect(component.employeeForm.pristine).toBeTrue()
    })

    it('should close add modal and reset form', () => {
      component.openAddModal()
      component.employeeForm.patchValue({
        firstname: 'test',
        lastname: 'Doe'
      })

      component.closeAddModal()

      expect(component.showAddModal).toBeFalse()
      expect(component.addEmployeeError).toBeNull()
      expect(component.employeeForm.get('firstname')?.value).toBeNull()
      expect(component.employeeForm.get('lastname')?.value).toBeNull()
    })

    it('should handle successful employee addition', fakeAsync(() => {
      const formValue = {
        firstname: 'test',
        lastname: 'Doe',
        email: 'test@example.com',
        phone: '1234567890',
        address: '123 Main St'
      }

      employeeServiceSpy.addEmployee.and.returnValue(of(mockEmployee))
      component.openAddModal()
      component.employeeForm.patchValue(formValue)

      component.addEmployee()
      tick()

      expect(employeeServiceSpy.addEmployee).toHaveBeenCalledWith({
        ...formValue,
        departmentId: undefined
      })
      expect(component.showAddModal).toBeFalse()
    }))

    it('should handle employee addition error', fakeAsync(() => {
      const errorMessage = 'Server error'
      const mockError = new HttpErrorResponse({ error: { message: errorMessage } })

      employeeServiceSpy.addEmployee.and.returnValue(throwError(() => mockError))
      errorHandlerServiceSpy.getErrorMessage.and.returnValue(errorMessage)

      component.openAddModal()
      component.employeeForm.patchValue({
        firstname: 'test',
        lastname: 'Doe',
        email: 'test@example.com',
        phone: '1234567890',
        address: '123 Main St'
      })

      component.addEmployee()
      tick()

      expect(component.addEmployeeError).toBe(errorMessage)
      expect(component.showAddModal).toBeTrue()
    }))
  })
})
