package com.sambit.sampharixErp.modules.inventory.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AddStockRequest {
    private String name;           // Maps to Medicine
    private String manufacturer;   // Maps to Medicine
    private BigDecimal gstPercentage; // Maps to Medicine

    private String batchNumber;    // Maps to Batch
    private LocalDate expiryDate;  // Maps to Batch
    private BigDecimal purchasePrice;// Maps to Batch
    private BigDecimal mrp;        // Maps to Batch

    private Integer quantity;      // Maps to Stock
}