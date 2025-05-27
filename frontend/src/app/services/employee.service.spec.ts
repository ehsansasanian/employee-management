import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { EmployeeService } from './employee.service'
import { ApiConfigService } from './api-config.service'
import { Employee, EmployeeRequestDTO } from '../models/employee.model'
import { HttpErrorResponse } from '@angular/common/http'

const apiConfigStub = {
  getEmployeesUrl: () => '/api/employees',
  getDepartmentsUrl: () => '/api/departments'
}

describe('EmployeeService', () => {
  let service: EmployeeService
  let httpMock: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        EmployeeService,
        { provide: ApiConfigService, useValue: apiConfigStub }
      ]
    })
    service = TestBed.inject(EmployeeService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should add an employee and update the cache', () => {
    const request: EmployeeRequestDTO = {
      firstname: 'test',
      lastname: 'lastname',
      email: 'test@example.com',
      phone: '1234567890',
      address: '123 Main St'
    }
    const response: Employee = {
      id: 1,
      fullName: 'test lastname',
      email: 'test@example.com',
      phone: '1234567890',
      address: '123 Main St',
      department: null
    }

    let result: Employee | undefined
    service.addEmployee(request).subscribe(emp => (result = emp))

    const req = httpMock.expectOne('/api/employees')
    expect(req.request.method).toBe('POST')
    req.flush(response)

    expect(result).toEqual(response)
    service.paginatedEmployees$.subscribe(cache => {
      if (cache) {
        expect(cache.some(e => e.id === response.id)).toBeTrue()
      }
    })
  })

  it('should handle error on getEmployeesByDepartment', () => {
    const errorMsg = '404 error'
    let errorResponse: any
    service.getEmployeesByDepartment(42).subscribe({
      next: () => {},
      error: err => (errorResponse = err)
    })
    const req = httpMock.expectOne('/api/departments/42/employees')
    expect(req.request.method).toBe('GET')
    req.flush(errorMsg, { status: 404, statusText: 'Not Found' })
    expect(errorResponse).toBeInstanceOf(HttpErrorResponse)
    expect(errorResponse.status).toBe(404)
  })
})
