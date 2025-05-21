package com.dedalus.em.repo;

import com.dedalus.em.PostgresTestResource;
import com.dedalus.em.domain.Department;
import io.quarkus.test.TestTransaction;
import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@QuarkusTestResource(PostgresTestResource.class)
class DepartmentRepositoryTest  {

    @Inject
    DepartmentRepository departmentRepository;

    @Test
    @TestTransaction
    void testPersist() {
        Department dep = new Department();
        dep.setName("Radiology");
        departmentRepository.persist(dep);
        assertNotNull(dep.getId());
        assertTrue(departmentRepository.isPersistent(dep));
    }

    @Test
    @TestTransaction
    void testExistsByName() {
        Department dep = new Department();
        dep.setName("Radiology");
        departmentRepository.persist(dep);

        assertTrue(departmentRepository.existsByName("Radiology"));
        assertFalse(departmentRepository.existsByName("NonExistingDept"));
    }

    // TODO: Add more tests for other methods in the repository
}
