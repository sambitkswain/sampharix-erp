package com.sambit.sampharixErp.modules.order.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class DistributorOrderResponse {
    private Long orderId;
    private String retailerName;
    private String retailerPhone;
    private String sellerName; // Added so Retailer can see who they bought from
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime orderDate;
    private List<OrderItemDto> items;

    @Data
    @Builder
    public static class OrderItemDto {
        private String medicineName;
        private String batchNumber;
        private Integer quantity;
        private BigDecimal price;
    }
}