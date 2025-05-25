package com.dedalus.em.repo;

import com.dedalus.em.domain.Department;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class DepartmentRepository implements PanacheRepositoryBase<Department, Long> {

    public boolean existsByName(String name) {
        return count("name", name) > 0;
    }

    public List<Department> searchByName(String q) {
        var like = "%" + q.toLowerCase() + "%";
        return list("LOWER(name) LIKE ?1 ", like);
    }
}
