package com.dedalus.em.service;

import com.dedalus.em.domain.Department;

import java.util.List;

public interface DepartmentService {

    List<Department> findAll(int page, int size);

    Department find(Long id);

    Department create(Department department);

    Department update(Long id, Department data);

    void delete(Long id);
}
