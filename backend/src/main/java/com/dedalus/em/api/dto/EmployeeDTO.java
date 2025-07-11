package com.dedalus.em.api.dto;

import com.dedalus.em.domain.Employee;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record EmployeeDTO(
        Long id,
        @NotBlank(message = "Name is required")
        @Size(max = 50)
        String firstname,
        @NotBlank(message = "Lastname is required")
        @Size(max = 100)
        String lastname,
        String address,
        String phone,
        @NotBlank(message = "E-mail is required")
        @Email(message = "E-mail must be valid")
        String email,
        @Positive(message = "departmentId is required")
        Long departmentId) {

    public Employee toEntity() {
        var e = new Employee();
        e.setId(id);
        e.setFirstname(firstname);
        e.setLastname(lastname);
        e.setAddress(address);
        e.setPhone(phone);
        e.setEmail(email);
        return e;
    }
}
