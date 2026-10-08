package com.sambit.sampharixErp.modules.inventory.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class MarketplaceItemResponse {
    private Long stockId;
    private String medicineName;
    private String manufacturer;
    private String batchNumber;

    // Distributor details so the Retailer knows who the seller is
    private Long distributorId;
    private String distributorName;

    private BigDecimal price; // The price the Distributor is selling it for
    private BigDecimal mrp;
    private Integer availableQuantity;
    private LocalDate expiryDate;
}