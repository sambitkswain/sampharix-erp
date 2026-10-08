package com.sambit.sampharixErp.modules.pos.dto;
import lombok.Data;
import java.util.List;

@Data
public class POSCheckoutRequest {
    private List<POSItemDto> items;

    @Data
    public static class POSItemDto {
        private Long stockId;
        private Integer quantity;
    }
}