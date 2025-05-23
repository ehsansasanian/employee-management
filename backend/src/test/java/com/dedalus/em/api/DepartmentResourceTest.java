package com.dedalus.em.api;

import com.dedalus.em.PostgresTestResource;
import com.dedalus.em.repo.DepartmentRepository;
import com.dedalus.em.repo.EmployeeRepository;
import io.quarkus.test.TestTransaction;
import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import jakarta.inject.Inject;
import jakarta.json.Json;
import jakarta.json.JsonObject;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
@QuarkusTestResource(PostgresTestResource.class)
class DepartmentResourceTest {

    @Inject
    EmployeeRepository employeeRepository;
    @Inject
    DepartmentRepository departmentRepository;

    @AfterEach
    @TestTransaction
    void tearDown() {
        employeeRepository.deleteAll();
        departmentRepository.deleteAll();
    }

    @Test
    @TestTransaction
    void departmentRoundTripTest() {
        // ---------- CREATE ----------
        JsonObject dto = Json.createObjectBuilder()
                .add("name", "Legal")
                .build();

        Integer deptId = given()
                .contentType(ContentType.JSON)
                .body(dto.toString())
                .when()
                .post("/api/departments")
                .then()
                .statusCode(201)
                .body("name", equalTo("Legal"))
                .body("employeeCount", equalTo(0)) // Assert initial employee count
                .extract()
                .path("id");

        // Verify employeeCount after creation by fetching the department
        given()
                .when()
                .get("/api/departments/{id}", deptId)
                .then()
                .statusCode(200)
                .body("name", equalTo("Legal"))
                .body("employeeCount", equalTo(0));


        JsonObject emp1Dto = Json.createObjectBuilder()
                .add("firstname", "Alice")
                .add("lastname", "Smith")
                .add("email", "alice.smith@example.com")
                .add("phone", "555-555-5555")
                .add("departmentId", deptId)
                .build();

        Integer emp1Id = given()
                .contentType(ContentType.JSON)
                .body(emp1Dto.toString())
                .when()
                .post("/api/employees")
                .then()
                .statusCode(201)
                .body("firstname", equalTo("Alice"))
                .body("departmentId", equalTo(deptId))
                .extract()
                .path("id");

        JsonObject emp2Dto = Json.createObjectBuilder()
                .add("firstname", "Bob")
                .add("lastname", "Johnson")
                .add("email", "bob.johnson@example.com")
                .add("phone", "555-555-5555")
                .add("departmentId", deptId)
                .build();

        Integer emp2Id = given()
                .contentType(ContentType.JSON)
                .body(emp2Dto.toString())
                .when()
                .post("/api/employees")
                .then()
                .statusCode(201)
                .body("firstname", equalTo("Bob"))
                .body("departmentId", equalTo(deptId))
                .extract()
                .path("id");

        // Verify employeeCount after adding employees by fetching the department
        given()
                .when()
                .get("/api/departments/{id}", deptId)
                .then()
                .statusCode(200)
                .body("name", equalTo("Legal")) // Name should still be "Legal" before update
                .body("employeeCount", equalTo(2));


        // ---------- UPDATE ----------
        JsonObject patch = Json.createObjectBuilder()
                .add("id", deptId)
                .add("name", "UPDATED")
                .build();

        given()
                .contentType(ContentType.JSON)
                .body(patch.toString())
                .when()
                .put("/api/departments/{id}", deptId)
                .then()
                .statusCode(200)
                .body("name", equalTo("UPDATED"))
                .body("employeeCount", equalTo(2)); // Assert employee count after update

        // ---------- DELETE ----------
        given()
                .when()
                .delete("/api/departments/{id}", deptId)
                .then()
                .statusCode(204);

        // verify list is empty
        given()
                .when()
                .get("/api/departments")
                .then()
                .statusCode(200)
                .body("$", hasSize(0));

        // verify employee does not have department
        given()
                .when()
                .get("/api/employees/{id}", emp1Id)
                .then()
                .statusCode(200)
                .body("id", equalTo(emp1Id))
                .body("department", nullValue());

        given()
                .when()
                .get("/api/employees/{id}", emp2Id)
                .then()
                .statusCode(200)
                .body("id", equalTo(emp2Id))
                .body("department", nullValue());
    }

    // TODO: Add more tests to cover edge cases
}
