package com.sambit.sampharixErp.modules.finance.repository;

import com.sambit.sampharixErp.modules.finance.entity.CreditAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CreditAccountRepository extends JpaRepository<CreditAccount, Long> {
    Optional<CreditAccount> findByRetailerId(Long retailerId);
}