package com.dedalus.em.service.impl;

import com.dedalus.em.domain.Department;
import com.dedalus.em.domain.Employee;
import com.dedalus.em.repo.DepartmentRepository;
import com.dedalus.em.service.DepartmentService;
import com.dedalus.em.service.exception.NotFoundException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@ApplicationScoped
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository repo;
    private final Logger logger = LoggerFactory.getLogger(DepartmentServiceImpl.class);

    @Inject
    public DepartmentServiceImpl(DepartmentRepository repo) {
        this.repo = repo;
    }

    public List<Department> findAll(int page, int size) {
        // TODO: Fix pagination to return paginated results
        logger.info("Fetching all departments with pagination: page={}, size={}", page, size);
        return repo.findAll().page(page, size).list();
    }

    public Department find(Long id) {
        logger.info("Fetching department with id: {}", id);
        return repo.findByIdOptional(id).orElseThrow(NotFoundException::new);
    }

    @Transactional
    public Department create(Department d) {
        logger.info("Creating new department with name: {}", d.getName());
        if (repo.existsByName(d.getName())) throw new IllegalArgumentException("Department name already exists");
        repo.persist(d);
        return d;
    }

    @Transactional
    public Department update(Long id, Department data) {
        logger.info("Updating department with id: {}", id);
        var existing = find(id);
        if (!existing.getName().equals(data.getName()) && repo.existsByName(data.getName())) {
            throw new IllegalArgumentException("Department name already exists");
        }
        existing.setName(data.getName());
        return existing;
    }

    @Transactional
    public void delete(Long id) {
        logger.info("Deleting department with id: {}", id);
        var dept = find(id);
        dept.getEmployees().forEach(e -> e.setDepartment(null));
        repo.delete(dept);
    }

    @Override
    public List<Employee> getEmployees(Long id) {
        logger.info("Fetching employees for department with id: {}", id);
        return repo.findByIdOptional(id)
                .map(Department::getEmployees)
                .orElseThrow(NotFoundException::new);
    }

    @Override
    public List<Department> search(String q, int page, int size) {
        // TODO: Fix pagination to return paginated results
        logger.info("Searching departments with query: '{}', page: {}, size: {}", q, page, size);
        return repo.searchByName(q);
    }
}
