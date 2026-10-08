package com.sambit.sampharixErp.modules.order.controller;

import com.sambit.sampharixErp.modules.order.dto.DistributorOrderResponse;
import com.sambit.sampharixErp.modules.order.dto.PlaceOrderRequest;
import com.sambit.sampharixErp.modules.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/place")
    public ResponseEntity<String> placeOrder(@RequestBody PlaceOrderRequest request) {
        String buyerEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(orderService.placeOrder(request, buyerEmail));
    }

    @GetMapping("/distributor")
    public ResponseEntity<List<DistributorOrderResponse>> getDistributorOrders() {
        String sellerEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(orderService.getDistributorOrders(sellerEmail));
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<String> updateOrderStatus(@PathVariable Long orderId, @RequestBody Map<String, String> payload) {
        String sellerEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        String newStatus = payload.get("status");
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, newStatus, sellerEmail));
    }

    // --- NEW ENDPOINTS ---

    @GetMapping("/retailer")
    public ResponseEntity<List<DistributorOrderResponse>> getRetailerOrders() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(orderService.getRetailerOrders(email));
    }

    @PutMapping("/clear-shipped")
    public ResponseEntity<String> clearShippedOrders() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(orderService.archiveShippedOrders(email));
    }
}