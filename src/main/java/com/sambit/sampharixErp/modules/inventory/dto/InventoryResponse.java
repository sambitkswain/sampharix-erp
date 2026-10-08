package com.sambit.sampharixErp.modules.inventory.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class InventoryResponse {
    private Long id; // This will be the Stock ID
    private String medicineName;
    private String manufacturer;
    private String batchNumber;
    private BigDecimal purchasePrice;
    private BigDecimal mrp;
    private Integer quantity;
    private LocalDate expiryDate;
}