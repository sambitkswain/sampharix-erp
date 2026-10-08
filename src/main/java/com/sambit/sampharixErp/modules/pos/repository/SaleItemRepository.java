package com.sambit.sampharixErp.modules.pos.repository;

import com.sambit.sampharixErp.modules.pos.entity.SaleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {
}