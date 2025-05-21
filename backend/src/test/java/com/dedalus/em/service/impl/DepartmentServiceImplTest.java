package com.dedalus.em.service.impl;

import com.dedalus.em.PostgresTestResource;
import com.dedalus.em.domain.Department;
import com.dedalus.em.service.DepartmentService;
import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/*
 * Important Note: This is to demonstrate that tests should be written for the service layer.
 * Alternatively, mocking could be done here. The goal is to provide an acceptable test coverage.
 * TODO: ADD MORE TESTS ...
 * */

@QuarkusTest
@QuarkusTestResource(PostgresTestResource.class)
class DepartmentServiceImplTest {

    @Inject
    DepartmentService service;

    @Test
    void createUpdateDelete() {
        // CREATE
        Department d = new Department();
        d.setName("Finance");
        d = service.create(d);
        assertNotNull(d.getId());

        // UPDATE
        Department patch = new Department();
        patch.setName("Accounting");
        Department updated = service.update(d.getId(), patch);
        assertEquals("Accounting", updated.getName());

        service.delete(updated.getId());
        assertTrue(service.findAll(0, 10).isEmpty());
    }
}