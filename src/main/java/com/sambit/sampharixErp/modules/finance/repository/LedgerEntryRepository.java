package com.sambit.sampharixErp.modules.finance.repository;

import com.sambit.sampharixErp.modules.finance.entity.LedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, Long> {
}