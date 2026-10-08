package com.sambit.sampharixErp.modules.user.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    private Role role; // ADMIN, DISTRIBUTOR, RETAILER

    private String phone;
    private String address;

    @Column(name = "is_active")
    private Boolean active; // Approval status: true = approved, false = pending

    @CreationTimestamp
    private LocalDateTime createdAt;
}