import {Injectable} from '@angular/core'
import {BehaviorSubject, catchError, Observable, tap, throwError} from 'rxjs'
import {Department} from '../models/department.model'
import {HttpClient, HttpErrorResponse} from '@angular/common/http'
import {ApiConfigService} from './api-config.service'
import {EmployeeService} from './employee.service'

export type NewDepartment = Omit<Department, 'id'>

@Injectable({providedIn: 'root'})
export class DepartmentService {
  private departmentsSubject = new BehaviorSubject<Department[]>([])
  departments$ = this.departmentsSubject.asObservable()

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
    private employeeService: EmployeeService
  ) {
    this.loadDepartments()
  }

  private loadDepartments(): void {
    this.http.get<Department[]>(this.apiConfig.getDepartmentsUrl())
      .pipe(
        tap(departments => this.departmentsSubject.next(departments)),
        catchError(this.handleError)
      )
      .subscribe()
  }

  addDepartment(department: NewDepartment): Observable<Department> {
    return this.http.post<Department>(this.apiConfig.getDepartmentsUrl(), department)
      .pipe(
        tap(newDepartment => {
          const current = this.departmentsSubject.value
          this.departmentsSubject.next([...current, newDepartment])
        }),
        catchError(this.handleError)
      )
  }

  deleteDepartment(id: number): Observable<void> {
    return this.http.delete<void>(this.apiConfig.getDepartmentsUrl() + `/${id}`)
      .pipe(
        tap(() => {
          // using optimistic update – alternatively could re-fetch all departments
          const current = this.departmentsSubject.value
          this.departmentsSubject.next(current.filter(dep => dep.id !== id))
          // Force refresh employee data since employees will be reassigned
          this.employeeService.invalidateCache()
        }),
        catchError(this.handleError)
      )
  }

  searchDepartments(query: string): Observable<Department[]> {
    console.log('Searching departments with query:', query)
    return this.http.get<Department[]>(`${this.apiConfig.getDepartmentsUrl()}?q=${encodeURIComponent(query)}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage: string
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`
    }
    console.error(errorMessage)
    return throwError(() => error)
  }
}
