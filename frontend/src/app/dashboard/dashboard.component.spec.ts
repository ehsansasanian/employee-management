import { ComponentFixture, TestBed } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'

import { DashboardComponent } from './dashboard.component'
import { DepartmentService } from '../services/department.service'
import { EmployeeService } from '../services/employee.service'
import { ErrorHandlerService } from '../services/error-handler-service'
import { SearchService } from '../services/search.service'

describe('DashboardComponent', () => {
  let component: DashboardComponent
  let fixture: ComponentFixture<DashboardComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [DashboardComponent],
      providers: [DepartmentService, EmployeeService, ErrorHandlerService, SearchService]
    })
    .compileComponents()

    fixture = TestBed.createComponent(DashboardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
