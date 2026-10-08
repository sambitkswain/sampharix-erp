package com.sambit.sampharixErp.modules.inventory.entity;

import com.sambit.sampharixErp.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "stock")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private Batch batch;

    // Why link to User? Because multiple Distributors use this ERP. We need to know WHO owns this 50 boxes of Paracetamol.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private Integer quantity;
}