package com.dedalus.em.repo;

import com.dedalus.em.PostgresTestResource;
import com.dedalus.em.domain.Department;
import com.dedalus.em.domain.Employee;
import io.quarkus.test.TestTransaction;
import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@QuarkusTestResource(PostgresTestResource.class)
class EmployeeRepositoryTest {

    @Inject
    EmployeeRepository employeeRepository;

    @Inject
    DepartmentRepository departmentRepository;

    Department testDepartment;

    void setup() {
        testDepartment = new Department();
        testDepartment.setName("DEPARTMENT_TEST");
        departmentRepository.persist(testDepartment);
    }

    @Test
    @TestTransaction
    void testPersist() {
        this.setup();
        Employee emp = new Employee();
        emp.setFirstname("Alice");
        emp.setLastname("Smith");
        emp.setEmail("alice.smith@example.com");
        emp.setPhone("+12345678901");
        emp.setAddress("123 Main St");
        emp.setDepartment(testDepartment);

        employeeRepository.persist(emp);

        assertNotNull(emp.getId());
        assertTrue(employeeRepository.isPersistent(emp));
    }

    @Test
    @TestTransaction
    void testSearchByName() {
        this.setup();
        Employee emp1 = new Employee();
        emp1.setFirstname("Bob");
        emp1.setLastname("Johnson");
        emp1.setEmail("bob.johnson@example.com");
        emp1.setPhone("+12345678902");
        emp1.setAddress("456 Elm St");
        emp1.setDepartment(testDepartment);

        Employee emp2 = new Employee();
        emp2.setFirstname("Carol");
        emp2.setLastname("Williams");
        emp2.setEmail("carol.williams@example.com");
        emp2.setPhone("+12345678903");
        emp2.setAddress("789 Oak St");
        emp2.setDepartment(testDepartment);

        employeeRepository.persist(emp1);
        employeeRepository.persist(emp2);

        List<Employee> result1 = employeeRepository.searchByName("bob");
        assertEquals(1, result1.size());
        assertEquals("Bob", result1.get(0).getFirstname());

        List<Employee> result2 = employeeRepository.searchByName("williams");
        assertEquals(1, result2.size());
        assertEquals("Carol", result2.get(0).getFirstname());
    }

    // TODO: Add more tests for other methods in the repository
}
