import {Component} from '@angular/core';
import {Department} from '../models/department.model';
import {DepartmentService, NewDepartment} from '../services/department.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  departments$: Observable<Department[]>;

  constructor(private departmentService: DepartmentService) {
    this.departments$ = this.departmentService.departments$;
  }

  addDepartment(): void {
    const newDepartment: NewDepartment = {
      name,
      employeeCount: 0
    };
    this.departmentService.addDepartment(newDepartment);
  }

  deleteDepartment(id: number): void {
    this.departmentService.deleteDepartment(id);
  }
}
