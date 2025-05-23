import {Component, ViewChild, ElementRef} from '@angular/core';
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
  showAddModal = false;
  newDepartmentName: string = '';
  @ViewChild('addDeptInput') addDeptInputRef?: ElementRef<HTMLInputElement>;

  constructor(private departmentService: DepartmentService) {
    this.departments$ = this.departmentService.departments$;
  }

  openAddModal(): void {
    this.showAddModal = true;
    this.newDepartmentName = '';
    setTimeout(() => {
      this.addDeptInputRef?.nativeElement.focus();
    });
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.newDepartmentName = '';
  }

  handleAddModalKey(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.addDepartment();
    } else if (event.key === 'Escape') {
      this.closeAddModal();
    }
  }

  addDepartment(): void {
    const name = this.newDepartmentName.trim();
    if (!name) return;
    const newDepartment: NewDepartment = {
      name,
      employeeCount: 0
    };
    this.departmentService.addDepartment(newDepartment);
    this.closeAddModal();
  }

  deleteDepartment(id: number): void {
    this.departmentService.deleteDepartment(id);
  }
}
