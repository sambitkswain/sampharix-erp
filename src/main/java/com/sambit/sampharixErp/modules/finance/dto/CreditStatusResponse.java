package com.sambit.sampharixErp.modules.finance.dto;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class CreditStatusResponse {
    private BigDecimal creditLimit;
    private BigDecimal outstandingBalance;
    private BigDecimal availableCredit;
}