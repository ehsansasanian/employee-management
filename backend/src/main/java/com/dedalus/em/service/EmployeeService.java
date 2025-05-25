package com.dedalus.em.service;

import com.dedalus.em.domain.Employee;

import java.util.List;

public interface EmployeeService {

    List<Employee> findAll(int page, int size);

    List<Employee> search(String q, int page, int size);

    Employee find(Long id);

    Employee create(Employee employee, Long departmentId);

    Employee update(Long id, Employee data, Long departmentId);

    void delete(Long id);

    Integer countUnassigned();

    List<Employee> getUnassignedEmployees();
}
