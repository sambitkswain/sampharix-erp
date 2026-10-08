package com.sambit.sampharixErp.modules.user.controller;

import com.sambit.sampharixErp.modules.user.entity.User;
import com.sambit.sampharixErp.modules.user.repository.UserRepository;
import jakarta.persistence.EntityManager; // NEW IMPORT
import org.springframework.transaction.annotation.Transactional; // NEW IMPORT
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final EntityManager entityManager; // NEW INJECTION

    @Data
    @Builder
    public static class AdminUserResponse {
        private Long id;
        private String businessName;
        private String email;
        private String contactNumber;
        private String role;
        private String approvalStatus;
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        List<AdminUserResponse> response = userRepository.findAll().stream()
                .map(user -> AdminUserResponse.builder()
                        .id(user.getId())
                        .businessName(user.getName())
                        .email(user.getEmail())
                        .contactNumber(user.getPhone())
                        .role(user.getRole().name())
                        .approvalStatus(user.getActive() != null && user.getActive() ? "APPROVED" : "PENDING")
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PutMapping("/users/{id}/approve")
    public ResponseEntity<String> approveUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setActive(true);
        userRepository.save(user);

        return ResponseEntity.ok("User approved successfully");
    }

    @DeleteMapping("/users/{id}")
    @Transactional // Required for modifying queries
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        // 1. Unlink any child users (e.g., Retailers linked to this Distributor)
        entityManager.createNativeQuery("UPDATE users SET parent_id = NULL WHERE parent_id = :id")
                .setParameter("id", id).executeUpdate();

        // 2. Delete the user's inventory stock
        entityManager.createNativeQuery("DELETE FROM stock WHERE owner_id = :id")
                .setParameter("id", id).executeUpdate();

        // 3. Delete the user's credit accounts
        entityManager.createNativeQuery("DELETE FROM credit_accounts WHERE user_id = :id")
                .setParameter("id", id).executeUpdate();

        // 4. NEW: Delete the user's orders (Solves the orders_buyer_id_fkey error)
        // We delete order_items first (if you have them) to prevent foreign key errors on the items
        try {
            entityManager.createNativeQuery("DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE buyer_id = :id)")
                    .setParameter("id", id).executeUpdate();
        } catch (Exception e) {
            // Ignore if order_items table doesn't exist yet
        }

        // Then delete the actual orders
        entityManager.createNativeQuery("DELETE FROM orders WHERE buyer_id = :id")
                .setParameter("id", id).executeUpdate();

        // 5. Safely delete the user now that all dependencies are gone
        userRepository.deleteById(id);

        return ResponseEntity.ok("User and associated data deleted successfully");
    }
}