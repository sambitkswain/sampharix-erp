package com.sambit.sampharixErp.modules.inventory.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "batches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Batch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Why @ManyToOne? Because one Medicine (Paracetamol) can have MANY batches arriving on different dates.
    // FetchType.LAZY saves memory by only loading the Medicine data when we explicitly ask for it.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @Column(name = "batch_number", nullable = false)
    private String batchNumber;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "purchase_price", precision = 10, scale = 2)
    private BigDecimal purchasePrice;

    @Column(precision = 10, scale = 2)
    private BigDecimal mrp;
}