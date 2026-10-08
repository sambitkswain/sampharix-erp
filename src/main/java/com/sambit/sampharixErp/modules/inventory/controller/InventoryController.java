package com.sambit.sampharixErp.modules.inventory.controller;

import com.sambit.sampharixErp.modules.inventory.dto.AddStockRequest;
import com.sambit.sampharixErp.modules.inventory.dto.InventoryResponse;
import com.sambit.sampharixErp.modules.inventory.dto.MarketplaceItemResponse;
import com.sambit.sampharixErp.modules.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    // Handles the form submission from React
    @PostMapping("/add")
    public ResponseEntity<String> addStock(@RequestBody AddStockRequest request) {

        // SecurityContextHolder automatically extracts the email from the JWT token.
        // This prevents hackers from faking their user ID.
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        String response = inventoryService.addStock(request, userEmail);
        return ResponseEntity.ok(response);
    }
    // Add this below your POST method
    @GetMapping("/all")
    public ResponseEntity<List<InventoryResponse>> getInventory() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(inventoryService.getInventoryForUser(userEmail));
    }
    @GetMapping("/marketplace")
    public ResponseEntity<List<MarketplaceItemResponse>> getMarketplace() {
        return ResponseEntity.ok(inventoryService.getGlobalMarketplace());
    }
    @PutMapping("/stock/{stockId}/update")
    public ResponseEntity<String> updateStockAndBatch(
            @PathVariable Long stockId,
            @RequestBody Map<String, Object> payload) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        Integer addedQty = (Integer) payload.get("addedQty");
        BigDecimal purchasePrice = payload.get("purchasePrice") != null ? new BigDecimal(payload.get("purchasePrice").toString()) : null;
        BigDecimal mrp = payload.get("mrp") != null ? new BigDecimal(payload.get("mrp").toString()) : null;
        LocalDate expiryDate = payload.get("expiryDate") != null && !payload.get("expiryDate").toString().isEmpty()
                ? LocalDate.parse(payload.get("expiryDate").toString()) : null;

        return ResponseEntity.ok(inventoryService.updateExistingStock(stockId, addedQty, purchasePrice, mrp, expiryDate, email));
    }
}