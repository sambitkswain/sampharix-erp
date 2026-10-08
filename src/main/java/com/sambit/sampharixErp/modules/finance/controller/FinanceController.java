package com.sambit.sampharixErp.modules.finance.controller;

import com.sambit.sampharixErp.modules.finance.dto.CreditStatusResponse;
import com.sambit.sampharixErp.modules.finance.entity.CreditAccount;
import com.sambit.sampharixErp.modules.finance.repository.CreditAccountRepository;
import com.sambit.sampharixErp.modules.user.entity.User;
import com.sambit.sampharixErp.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/finance")
@RequiredArgsConstructor
public class FinanceController {

    private final UserRepository userRepository;
    private final CreditAccountRepository creditAccountRepository;

    @GetMapping("/credit-status")
    public ResponseEntity<CreditStatusResponse> getCreditStatus() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User retailer = userRepository.findByEmail(email).orElseThrow();

        CreditAccount account = creditAccountRepository.findByRetailerId(retailer.getId())
                .orElse(CreditAccount.builder()
                        .creditLimit(BigDecimal.valueOf(500000.00)) // Default limit
                        .outstandingBalance(BigDecimal.ZERO)
                        .build());

        BigDecimal available = account.getCreditLimit().subtract(account.getOutstandingBalance());

        return ResponseEntity.ok(CreditStatusResponse.builder()
                .creditLimit(account.getCreditLimit())
                .outstandingBalance(account.getOutstandingBalance())
                .availableCredit(available)
                .build());
    }
}