import {Injectable} from '@angular/core'
import {HttpErrorResponse} from '@angular/common/http'

@Injectable({providedIn: 'root'})
export class ErrorHandlerService {
  //TODO: Make it more sophisticated – BE should add error body with error code and message
  getErrorMessage(error: any): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 409 || error.status === 400) {
        return 'value already exists.'
      } else {
        return error.error?.message || 'An error occurred while processing your request.'
      }
    }
    return 'An unexpected error occurred.'
  }
}
