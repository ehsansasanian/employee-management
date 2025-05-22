package com.dedalus.em.api.dto;

import com.dedalus.em.domain.Department;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DepartmentDTO(
        Long id,
        @NotBlank(message = "Department name is required")
        @Size(max = 100, message = "Department name must be at most 100 characters")
        String name,
        Integer employeeCount) {

    /*
     * Ideally, we would use a mapper library like MapStruct to handle the conversion between DTO and entity.
     * For simplicity, we are doing it manually here.
     * */

    public static DepartmentDTO fromEntity(Department d) {
        return new DepartmentDTO(d.getId(), d.getName(), d.getEmployeeCount());
    }

    public Department toEntity() {
        var d = new Department();
        d.setId(id);
        d.setName(name);
        return d;
    }
}
