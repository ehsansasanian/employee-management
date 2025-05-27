import { TestBed } from '@angular/core/testing'
import { RouterModule } from '@angular/router'
import { ReactiveFormsModule } from '@angular/forms'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { Component } from '@angular/core'
import { AppComponent } from './app.component'
import { SearchService } from './services/search.service'
import { DepartmentService } from './services/department.service'
import { EmployeeService } from './services/employee.service'
import { ErrorHandlerService } from './services/error-handler-service'

@Component({selector: 'dashboard', template: '', standalone: false})
class MockDashboardComponent {}

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        ReactiveFormsModule,
        HttpClientTestingModule
      ],
      declarations: [
        AppComponent,
        MockDashboardComponent
      ],
      providers: [
        SearchService,
        DepartmentService,
        EmployeeService,
        ErrorHandlerService
      ]
    }).compileComponents()
  })

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent)
    const app = fixture.componentInstance
    expect(app).toBeTruthy()
  })

  it('should initialize search control', () => {
    const fixture = TestBed.createComponent(AppComponent)
    const app = fixture.componentInstance
    expect(app.searchControl).toBeTruthy()
  })

  it('should handle search focus and blur', () => {
    const fixture = TestBed.createComponent(AppComponent)
    const app = fixture.componentInstance

    app.onSearchFocus()
    expect(app['searchSub']).toBeTruthy()

    app.onSearchBlur()
    expect(app['searchSub']).toBeUndefined()
  })
})
