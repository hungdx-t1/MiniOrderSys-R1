package com.bepro.MiniOrderSys.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

import com.bepro.MiniOrderSys.entity.Invoice;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByOrderId(Long orderId);
}
