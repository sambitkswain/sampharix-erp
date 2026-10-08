package com.sambit.sampharixErp.modules.pos.service;

import com.sambit.sampharixErp.modules.inventory.entity.Stock;
import com.sambit.sampharixErp.modules.inventory.repository.StockRepository;
import com.sambit.sampharixErp.modules.pos.dto.POSCheckoutRequest;
import com.sambit.sampharixErp.modules.pos.entity.Sale;
import com.sambit.sampharixErp.modules.pos.entity.SaleItem;
import com.sambit.sampharixErp.modules.pos.repository.SaleItemRepository;
import com.sambit.sampharixErp.modules.pos.repository.SaleRepository;
import com.sambit.sampharixErp.modules.user.entity.User;
import com.sambit.sampharixErp.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class POSService {
    private final UserRepository userRepository;
    private final StockRepository stockRepository;
    private final SaleRepository saleRepository;
    private final SaleItemRepository saleItemRepository;

    @Transactional
    public String processSale(POSCheckoutRequest request, String retailerEmail) {
        User retailer = userRepository.findByEmail(retailerEmail)
                .orElseThrow(() -> new RuntimeException("Retailer not found"));

        // 1. Create the Master Bill (Sale)
        Sale sale = Sale.builder()
                .retailer(retailer)
                .totalAmount(BigDecimal.ZERO)
                .build();
        sale = saleRepository.save(sale);

        BigDecimal grandTotal = BigDecimal.ZERO;

        // 2. Process each item scanned at the counter
        for (POSCheckoutRequest.POSItemDto item : request.getItems()) {
            Stock stock = stockRepository.findById(item.getStockId())
                    .orElseThrow(() -> new RuntimeException("Stock not found"));

            if (stock.getQuantity() < item.getQuantity()) {
                throw new RuntimeException("Not enough stock for " + stock.getBatch().getMedicine().getName());
            }

            // Deduct from Retailer's physical shelf
            stock.setQuantity(stock.getQuantity() - item.getQuantity());
            stockRepository.save(stock);

            // Calculate cost using the Batch's MRP (Retail Price)
            BigDecimal lineTotal = stock.getBatch().getMrp().multiply(BigDecimal.valueOf(item.getQuantity()));
            grandTotal = grandTotal.add(lineTotal);

            // Record the line item
            SaleItem saleItem = SaleItem.builder()
                    .sale(sale)
                    .batch(stock.getBatch())
                    .quantity(item.getQuantity())
                    .price(stock.getBatch().getMrp())
                    .build();
            saleItemRepository.save(saleItem);
        }

        // 3. Finalize Bill
        sale.setTotalAmount(grandTotal);
        saleRepository.save(sale);

        return "Sale completed successfully! Invoice #" + sale.getId() + " generated.";
    }
}