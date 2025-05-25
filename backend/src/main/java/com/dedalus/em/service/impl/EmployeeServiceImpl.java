package com.dedalus.em.service.impl;

import com.dedalus.em.domain.Employee;
import com.dedalus.em.repo.DepartmentRepository;
import com.dedalus.em.repo.EmployeeRepository;
import com.dedalus.em.service.EmployeeService;
import com.dedalus.em.service.exception.NotFoundException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class EmployeeServiceImpl implements EmployeeService {
    private final Logger logger = LoggerFactory.getLogger(EmployeeServiceImpl.class);

    private final EmployeeRepository repo;
    private final DepartmentRepository deptRepo;

    @Inject
    public EmployeeServiceImpl(EmployeeRepository repo, DepartmentRepository deptRepo) {
        this.repo = repo;
        this.deptRepo = deptRepo;
    }

    public List<Employee> findAll(int page, int size) {
        // TODO: Fix pagination to return paginated results
        logger.info("Fetching all employees with pagination: page={}, size={}", page, size);
        return repo.findAll().page(page, size).list();
    }

    public List<Employee> search(String q, int page, int size) {
        logger.info("Searching employees with query: '{}', page={}, size={}", q, page, size);
        return repo.searchByName(q);
    }

    public Employee find(Long id) {
        logger.info("Finding employee with id: {}", id);
        return repo.findByIdOptional(id).orElseThrow(NotFoundException::new);
    }

    @Transactional
    public Employee create(Employee e, Long deptId) {
        logger.info("Creating new employee: {}", e);
        Optional.ofNullable(deptId)
                .flatMap(deptRepo::findByIdOptional)
                .ifPresent(e::setDepartment);
        repo.persist(e);
        return e;
    }

    @Transactional
    public Employee update(Long id, Employee data, Long deptId) {
        logger.info("Updating employee with id: {}, new data: {}", id, data);
        var existing = find(id);
        existing.setFirstname(data.getFirstname());
        existing.setLastname(data.getLastname());
        existing.setAddress(data.getAddress());
        existing.setPhone(data.getPhone());
        existing.setEmail(data.getEmail());
        existing.setDepartment(deptRepo.findByIdOptional(deptId).orElseThrow(NotFoundException::new));
        return existing;
    }

    @Transactional
    public void delete(Long id) {
        logger.info("Deleting employee with id: {}", id);
        repo.delete(find(id));
    }

    @Override
    public Integer countUnassigned() {
        logger.info("Counting unassigned employees");
        return repo.countUnassigned();
    }

    @Override
    public List<Employee> getUnassignedEmployees() {
        return repo.fetchUnassignedEmployees();
    }
}
