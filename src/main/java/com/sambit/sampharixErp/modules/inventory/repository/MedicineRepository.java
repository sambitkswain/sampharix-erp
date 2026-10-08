package com.sambit.sampharixErp.modules.inventory.repository;

import com.sambit.sampharixErp.modules.inventory.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    // Allows us to check if a medicine exists before creating a duplicate
    Optional<Medicine> findByNameIgnoreCase(String name);
}