package com.dedalus.em.repo;

import com.dedalus.em.domain.Employee;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class EmployeeRepository implements PanacheRepositoryBase<Employee, Long> {

    public List<Employee> searchByName(String q) {
        var like = "%" + q.toLowerCase() + "%";
        return list("LOWER(firstname) LIKE ?1 OR LOWER(lastname) LIKE ?1", like);
    }

    public Integer countUnassigned() {
        return (int) count("department IS NULL");
    }

    public List<Employee> fetchUnassignedEmployees() {
        return list("department IS NULL");
    }
}