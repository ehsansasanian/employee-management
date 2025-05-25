import { Injectable } from '@angular/core'
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  private readonly baseUrl = environment.apiUrl

  getDepartmentsUrl(): string {
    return `${this.baseUrl}/departments`
  }
  getEmployeesUrl(): string {
    return `${this.baseUrl}/employees`
  }

  getEmployeeUrl(id: number): string {
    return `${this.baseUrl}/employees/${id}`
  }
}
