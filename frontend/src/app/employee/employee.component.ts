import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Employee} from '../models/employee.model';
import {EmployeeService} from '../services/employee.service';

@Component({
  selector: 'app-employee',
  standalone: false,
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.scss'
})
export class EmployeeComponent implements OnInit {
  employees$: Observable<Employee[]>;

  constructor(private employeeService: EmployeeService) {
    this.employees$ = this.employeeService.employees$;
  }

  ngOnInit(): void {}
}
