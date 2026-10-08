package com.sambit.sampharixErp.modules.inventory.repository;

import com.sambit.sampharixErp.modules.inventory.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BatchRepository extends JpaRepository<Batch, Long> {
    Optional<Batch> findByBatchNumberAndMedicineId(String batchNumber, Long medicineId);
}