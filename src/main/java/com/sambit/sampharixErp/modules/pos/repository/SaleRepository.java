package com.sambit.sampharixErp.modules.pos.repository;

import com.sambit.sampharixErp.modules.pos.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {
    // JpaRepository automatically gives us save(), findById(), findAll(), etc.
}