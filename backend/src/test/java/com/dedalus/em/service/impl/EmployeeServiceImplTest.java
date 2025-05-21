package com.dedalus.em.service.impl;

import com.dedalus.em.PostgresTestResource;
import com.dedalus.em.domain.Department;
import com.dedalus.em.domain.Employee;
import com.dedalus.em.service.DepartmentService;
import com.dedalus.em.service.EmployeeService;
import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/*
 * Important Note: This is to demonstrate that tests should be written for the service layer.
 * Alternatively, mocking could be done here. The goal is to provide an acceptable test coverage.
 * TODO: ADD MORE TESTS ...
 * */
@QuarkusTest
@QuarkusTestResource(PostgresTestResource.class)
class EmployeeServiceImplTest {

    @Inject
    DepartmentService deptService;
    @Inject
    EmployeeService empService;

    Long deptId;

    @BeforeEach
    void setUp() {
        Department d = new Department();
        d.setName("Engineering");
        deptId = deptService.create(d).getId();
    }

    @Test
    void createAndUpdate() {
        Employee e = new Employee();
        e.setFirstname("Ada");
        e.setLastname("Lovelace");
        e.setAddress("London");
        e.setPhone("+431234567890");
        e.setEmail("ada@company.com");
        Employee persisted = empService.create(e, deptId);

        assertNotNull(persisted.getId());
        assertEquals(deptId, persisted.getDepartment().getId());

        // UPDATE
        Employee patch = new Employee();
        patch.setFirstname("Augusta Ada");
        patch.setLastname("Lovelace");
        patch.setAddress("Somerset House");
        patch.setPhone("+439876543210");
        patch.setEmail("ada.lovelace@company.com");

        Employee updated = empService.update(persisted.getId(), patch, deptId);
        assertTrue(updated.getFirstname().startsWith("Augusta"));
        assertTrue(updated.getPhone().endsWith("3210"));
    }
}