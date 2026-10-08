package com.sambit.sampharixErp.modules.finance.entity;

import com.sambit.sampharixErp.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "credit_accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "retailer_id", nullable = false, unique = true)
    private User retailer;

    @Column(name = "credit_limit", nullable = false, precision = 12, scale = 2)
    private BigDecimal creditLimit;

    @Column(name = "outstanding_balance", nullable = false, precision = 12, scale = 2)
    private BigDecimal outstandingBalance;
}