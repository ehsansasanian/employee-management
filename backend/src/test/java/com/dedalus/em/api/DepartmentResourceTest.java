package com.dedalus.em.api;

import com.dedalus.em.PostgresTestResource;
import io.quarkus.test.TestTransaction;
import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import jakarta.json.Json;
import jakarta.json.JsonObject;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

// TODO: Add more tests to cover edge cases
@QuarkusTest
@QuarkusTestResource(PostgresTestResource.class)
class DepartmentResourceTest {

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
                .extract()
                .path("id");

        JsonObject emp1Dto = Json.createObjectBuilder()
                .add("firstName", "Alice")
                .add("lastName", "Smith")
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
                .statusCode(200)
                .body("firstName", equalTo("Alice"))
                .body("departmentId", equalTo(deptId))
                .extract()
                .path("id");

        JsonObject emp2Dto = Json.createObjectBuilder()
                .add("firstName", "Bob")
                .add("lastName", "Johnson")
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
                .statusCode(200)
                .body("firstName", equalTo("Bob"))
                .body("departmentId", equalTo(deptId))
                .extract()
                .path("id");


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
                .body("name", equalTo("UPDATED"));

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
}
