package com.sambit.sampharixErp.modules.order.dto;

import lombok.Data;
import java.util.List;

@Data
public class PlaceOrderRequest {
    private List<CartItemDto> items;

    @Data
    public static class CartItemDto {
        private Long stockId;
        private Integer quantity;
    }
}