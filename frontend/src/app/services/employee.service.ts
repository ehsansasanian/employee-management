import {Injectable} from '@angular/core';
import {BehaviorSubject, catchError, Observable, tap, throwError} from 'rxjs';
import {Employee, EmployeeRequestDTO} from '../models/employee.model';
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

  getEmployeesPaginated(page: number = 0, size: number = 100): Observable<Employee[]> {
    // TODO: Handle pagination and add functionality to the UI too
    if (page === 0 && this.paginatedEmployeesSubject.value) {
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

  addEmployee(request: EmployeeRequestDTO): Observable<Employee> {
    return this.http.post<Employee>(this.apiConfig.getEmployeesUrl(), request)
      .pipe(
        tap(newEmployee => {
          const current = this.paginatedEmployeesSubject.value;
          if (current) {
            this.paginatedEmployeesSubject.next([...current, newEmployee]);
          }
        }),
        catchError(this.handleError)
      );
  }

  invalidateCache(): void {
    this.paginatedEmployeesSubject.next(null);
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiConfig.getEmployeesUrl()}/${id}`)
      .pipe(
        tap(() => {
          const current = this.paginatedEmployeesSubject.value;
          if (current) {
            this.paginatedEmployeesSubject.next(current.filter(emp => emp.id !== id));
          }
        }),
        catchError(this.handleError)
      );
  }

  searchEmployees(query: string): Observable<Employee[]> {
    console.log('searchEmployees called with query:', query);
    return this.http.get<Employee[]>(`${this.apiConfig.getEmployeesUrl()}?q=${encodeURIComponent(query)}`)
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
    return throwError(() => error);
  }
}
