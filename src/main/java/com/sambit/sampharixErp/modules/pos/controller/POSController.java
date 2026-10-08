package com.sambit.sampharixErp.modules.pos.controller;

import com.sambit.sampharixErp.modules.pos.dto.POSCheckoutRequest;
import com.sambit.sampharixErp.modules.pos.service.POSService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pos")
@RequiredArgsConstructor
public class POSController {
    private final POSService posService;

    @PostMapping("/checkout")
    public ResponseEntity<String> checkout(@RequestBody POSCheckoutRequest request) {
        String retailerEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(posService.processSale(request, retailerEmail));
    }
}