import {Injectable} from '@angular/core';
import {BehaviorSubject, catchError, Observable, tap, throwError} from 'rxjs';
import {Employee} from '../models/employee.model';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {ApiConfigService} from './api-config.service';

@Injectable({providedIn: 'root'})
export class EmployeeService {
  private paginatedEmployeesSubject = new BehaviorSubject<Employee[] | null>(null);
  paginatedEmployees$ = this.paginatedEmployeesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
  }

  getEmployeesPaginated(page: number = 0, size: number = 10, forceRefresh: boolean = false): Observable<Employee[]> {
    if (!forceRefresh && page === 0 && this.paginatedEmployeesSubject.value) {
      // reading from cached value if available
      return this.paginatedEmployees$ as Observable<Employee[]>;
    }
    return this.http.get<Employee[]>(`${this.apiConfig.getEmployeesUrl()}?page=${page}&size=${size}`)
      .pipe(
        tap(employees => {
          if (page === 0) {
            this.paginatedEmployeesSubject.next(employees);
          }
        }),
        catchError(this.handleError)
      );
  }

  getEmployeesByDepartment(departmentId: number): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiConfig.getDepartmentsUrl()}/${departmentId}/employees`)
      .pipe(catchError(this.handleError))
  }

  getUnassignedEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiConfig.getEmployeesUrl() + '/unassigned')
      .pipe(catchError(this.handleError))
  }

  getUnassignedEmployeeCount(): Observable<number> {
    return this.http.get<number>(this.apiConfig.getEmployeesUrl() + '/unassigned/count')
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred in EmployeeService';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      errorMessage = `Server-side error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
