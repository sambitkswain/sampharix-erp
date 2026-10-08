package com.sambit.sampharixErp.modules.order.repository;

import com.sambit.sampharixErp.modules.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    // Fetches the specific medicines inside a single order
    List<OrderItem> findByOrderId(Long orderId);
}