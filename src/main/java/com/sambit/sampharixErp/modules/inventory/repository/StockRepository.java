package com.sambit.sampharixErp.modules.inventory.repository;

import com.sambit.sampharixErp.modules.inventory.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {
    Optional<Stock> findByBatchIdAndOwnerId(Long batchId, Long ownerId);
    // Add this inside StockRepository interface so we can find all stock owned by this specific distributor
    List<Stock> findAllByOwnerId(Long ownerId);

}