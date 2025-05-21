package com.dedalus.em.repo;

import com.dedalus.em.domain.Department;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class DepartmentRepository implements PanacheRepositoryBase<Department, Long> {

    public boolean existsByName(String name) {
        return count("name", name) > 0;
    }
}
