package com.sambit.sampharixErp.modules.order.repository;

import com.sambit.sampharixErp.modules.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findBySellerIdOrderByCreatedAtDesc(Long sellerId);

    // NEW: Find orders placed by the Retailer
    List<Order> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);
}