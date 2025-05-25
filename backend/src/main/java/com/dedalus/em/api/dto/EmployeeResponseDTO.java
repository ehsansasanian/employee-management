package com.dedalus.em.api.dto;

import com.dedalus.em.domain.Employee;

public record EmployeeResponseDTO(
        Long id,
        String fullName,
        String address,
        String phone,
        String email,
        DepartmentDTO department
) {

    public static EmployeeResponseDTO fromEntity(Employee employee) {
        return new EmployeeResponseDTO(
                employee.getId(),
                employee.getFirstname() + " " + employee.getLastname(),
                employee.getAddress(),
                employee.getPhone(),
                employee.getEmail(),
                employee.getDepartment() != null ? DepartmentDTO.fromEntity(employee.getDepartment()) : null
        );
    }
}
