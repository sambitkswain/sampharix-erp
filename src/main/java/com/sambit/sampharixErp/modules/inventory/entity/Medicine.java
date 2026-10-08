package com.sambit.sampharixErp.modules.inventory.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "medicines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String manufacturer;

    // Why BigDecimal? It prevents weird decimal rounding errors (like 10.00000001) that happen with Double
    @Column(name = "gst_percentage", precision = 5, scale = 2)
    private BigDecimal gstPercentage;

    private String barcode;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}