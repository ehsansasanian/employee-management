package com.dedalus.em.api;

import com.dedalus.em.PostgresTestResource;
import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import jakarta.json.Json;
import jakarta.json.JsonObject;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;

// TODO: Add more tests to cover edge cases
@QuarkusTest
@QuarkusTestResource(PostgresTestResource.class)
class DepartmentResourceTest {

    @Test
    void departmentRoundTripTest() {
        // ---------- CREATE ----------
        JsonObject dto = Json.createObjectBuilder()
                .add("name", "Legal")
                .build();

        Integer id = given()
                .contentType(ContentType.JSON)
                .body(dto.toString())
                .when()
                .post("/api/departments")
                .then()
                .statusCode(201)           // 200 OK because we return DTO
                .body("name", equalTo("Legal"))
                .extract()
                .path("id");


        // ---------- UPDATE ----------
        JsonObject patch = Json.createObjectBuilder()
                .add("id", id)
                .add("name", "UPDATED")
                .build();

        given()
                .contentType(ContentType.JSON)
                .body(patch.toString())
                .when()
                .put("/api/departments/{id}", id)
                .then()
                .statusCode(200)
                .body("name", equalTo("UPDATED"));

        // ---------- DELETE ----------
        given()
                .when()
                .delete("/api/departments/{id}", id)
                .then()
                .statusCode(204);

        // verify list is empty
        given()
                .when()
                .get("/api/departments")
                .then()
                .statusCode(200)
                .body("$", hasSize(0));
    }
}
