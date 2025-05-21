package com.dedalus.em.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "employees",
        uniqueConstraints = @UniqueConstraint(name = "uk_employee_email", columnNames = "email"))
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstname;

    @Column(nullable = false)
    private String lastname;

    /* To reduce complexity, I did not create a separate entity for Address
       But it can be separated table with dedicated attributes (Postal Code, City, etc.)
     */
    private String address;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String email;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Department department;
}
