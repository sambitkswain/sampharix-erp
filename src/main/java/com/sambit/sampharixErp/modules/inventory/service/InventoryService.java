package com.sambit.sampharixErp.modules.inventory.service;

import com.sambit.sampharixErp.modules.inventory.dto.AddStockRequest;
import com.sambit.sampharixErp.modules.inventory.dto.InventoryResponse;
import com.sambit.sampharixErp.modules.inventory.dto.MarketplaceItemResponse;
import com.sambit.sampharixErp.modules.inventory.entity.Batch;
import com.sambit.sampharixErp.modules.inventory.entity.Medicine;
import com.sambit.sampharixErp.modules.inventory.entity.Stock;
import com.sambit.sampharixErp.modules.inventory.repository.BatchRepository;
import com.sambit.sampharixErp.modules.inventory.repository.MedicineRepository;
import com.sambit.sampharixErp.modules.inventory.repository.StockRepository;
import com.sambit.sampharixErp.modules.user.entity.User;
import com.sambit.sampharixErp.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final MedicineRepository medicineRepository;
    private final BatchRepository batchRepository;
    private final StockRepository stockRepository;
    private final UserRepository userRepository;

    // @Transactional is a lifesaver. If step 4 fails, it undoes Steps 1, 2, and 3 automatically!
    @Transactional
    public String addStock(AddStockRequest request, String userEmail) {

        // 1. Get the logged-in Distributor from the DB
        User owner = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Distributor not found"));

        // 2. Check if Medicine exists. If not, save it to the catalog.
        Medicine medicine = medicineRepository.findByNameIgnoreCase(request.getName())
                .orElseGet(() -> {
                    Medicine newMed = Medicine.builder()
                            .name(request.getName())
                            .manufacturer(request.getManufacturer())
                            .gstPercentage(request.getGstPercentage())
                            .build();
                    return medicineRepository.save(newMed);
                });

        // 3. Check if this specific Batch exists. If not, save it.
        Batch batch = batchRepository.findByBatchNumberAndMedicineId(request.getBatchNumber(), medicine.getId())
                .orElseGet(() -> {
                    Batch newBatch = Batch.builder()
                            .medicine(medicine)
                            .batchNumber(request.getBatchNumber())
                            .expiryDate(request.getExpiryDate())
                            .purchasePrice(request.getPurchasePrice())
                            .mrp(request.getMrp())
                            .build();
                    return batchRepository.save(newBatch);
                });

        // 4. Update the Stock. If they have it already, add to quantity. If not, create it.
        Stock stock = stockRepository.findByBatchIdAndOwnerId(batch.getId(), owner.getId())
                .orElse(Stock.builder()
                        .batch(batch)
                        .owner(owner)
                        .quantity(0)
                        .build());

        stock.setQuantity(stock.getQuantity() + request.getQuantity());
        stockRepository.save(stock);

        return "Successfully added " + request.getQuantity() + " units of " + medicine.getName();
    }
    // Add this below your addStock method
    // NEW: Add this annotation to prevent LazyInitializationException
    @Transactional(readOnly = true)
    public List<InventoryResponse> getInventoryForUser(String userEmail) {
        User owner = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Distributor not found"));

        // We fetch the stock, and map the connected Batch and Medicine data into a flat DTO for React
        return stockRepository.findAllByOwnerId(owner.getId()).stream().map(stock ->
                InventoryResponse.builder()
                        .id(stock.getId())
                        .medicineName(stock.getBatch().getMedicine().getName())
                        .manufacturer(stock.getBatch().getMedicine().getManufacturer())
                        .batchNumber(stock.getBatch().getBatchNumber())
                        .purchasePrice(stock.getBatch().getPurchasePrice())
                        .mrp(stock.getBatch().getMrp())
                        .quantity(stock.getQuantity())
                        .expiryDate(stock.getBatch().getExpiryDate())
                        .build()
        ).collect(java.util.stream.Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MarketplaceItemResponse> getGlobalMarketplace() {
        // Fetch all stock from the database, filter out empty stock, and map to DTO
        return stockRepository.findAll().stream()
                .filter(stock -> stock.getQuantity() > 0)
                .map(stock -> MarketplaceItemResponse.builder()
                        .stockId(stock.getId())
                        .medicineName(stock.getBatch().getMedicine().getName())
                        .manufacturer(stock.getBatch().getMedicine().getManufacturer())
                        .batchNumber(stock.getBatch().getBatchNumber())
                        .distributorId(stock.getOwner().getId())
                        .distributorName(stock.getOwner().getName()) // Shows the Distributor's Business Name
                        .price(stock.getBatch().getPurchasePrice())
                        .mrp(stock.getBatch().getMrp())
                        .availableQuantity(stock.getQuantity())
                        .expiryDate(stock.getBatch().getExpiryDate())
                        .build()
                ).collect(Collectors.toList());
    }
    @Transactional
    public String updateExistingStock(Long stockId, Integer addedQty, BigDecimal newPurchasePrice, BigDecimal newMrp, LocalDate newExpiryDate, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail).orElseThrow();

        Stock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new RuntimeException("Stock not found"));

        if (!stock.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("Unauthorized to modify this stock");
        }

        // 1. Top up the quantity
        stock.setQuantity(stock.getQuantity() + addedQty);
        stockRepository.save(stock);

        // 2. Update Batch pricing and expiry if changed
        var batch = stock.getBatch();
        if (newPurchasePrice != null) {
            batch.setPurchasePrice(newPurchasePrice);
        }
        if (newMrp != null) {
            batch.setMrp(newMrp);
        }
        if (newExpiryDate != null) {
            batch.setExpiryDate(newExpiryDate);
        }
        batchRepository.save(batch);

        return "Stock and batch details updated successfully!";
    }
}