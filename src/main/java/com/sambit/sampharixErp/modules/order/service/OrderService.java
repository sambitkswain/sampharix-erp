package com.sambit.sampharixErp.modules.order.service;

import com.sambit.sampharixErp.modules.finance.entity.CreditAccount;
import com.sambit.sampharixErp.modules.finance.entity.LedgerEntry;
import com.sambit.sampharixErp.modules.finance.repository.CreditAccountRepository;
import com.sambit.sampharixErp.modules.finance.repository.LedgerEntryRepository;
import com.sambit.sampharixErp.modules.inventory.entity.Stock;
import com.sambit.sampharixErp.modules.inventory.repository.StockRepository;
import com.sambit.sampharixErp.modules.order.dto.DistributorOrderResponse;
import com.sambit.sampharixErp.modules.order.dto.PlaceOrderRequest;
import com.sambit.sampharixErp.modules.order.entity.Order;
import com.sambit.sampharixErp.modules.order.entity.OrderItem;
import com.sambit.sampharixErp.modules.order.repository.OrderItemRepository;
import com.sambit.sampharixErp.modules.order.repository.OrderRepository;
import com.sambit.sampharixErp.modules.user.entity.User;
import com.sambit.sampharixErp.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final UserRepository userRepository;
    private final StockRepository stockRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CreditAccountRepository creditAccountRepository;
    private final LedgerEntryRepository ledgerEntryRepository;

    @Transactional
    public String placeOrder(PlaceOrderRequest request, String buyerEmail) {
        User buyer = userRepository.findByEmail(buyerEmail).orElseThrow(() -> new RuntimeException("Buyer not found"));
        List<Long> stockIds = request.getItems().stream().map(PlaceOrderRequest.CartItemDto::getStockId).collect(Collectors.toList());
        List<Stock> requestedStocks = stockRepository.findAllById(stockIds);
        Map<User, List<Stock>> itemsBySeller = requestedStocks.stream().collect(Collectors.groupingBy(Stock::getOwner));

        for (Map.Entry<User, List<Stock>> entry : itemsBySeller.entrySet()) {
            User seller = entry.getKey();
            List<Stock> sellerStocks = entry.getValue();
            BigDecimal orderTotal = BigDecimal.ZERO;

            Order order = Order.builder().buyer(buyer).seller(seller).status("CREATED").totalAmount(BigDecimal.ZERO).build();
            order = orderRepository.save(order);

            for (Stock stock : sellerStocks) {
                Integer requestedQty = request.getItems().stream().filter(i -> i.getStockId().equals(stock.getId())).findFirst().get().getQuantity();
                if (stock.getQuantity() < requestedQty) throw new RuntimeException("Insufficient stock");

                stock.setQuantity(stock.getQuantity() - requestedQty);
                stockRepository.save(stock);

                Stock buyerStock = stockRepository.findByBatchIdAndOwnerId(stock.getBatch().getId(), buyer.getId())
                        .orElse(Stock.builder().batch(stock.getBatch()).owner(buyer).quantity(0).build());
                buyerStock.setQuantity(buyerStock.getQuantity() + requestedQty);
                stockRepository.save(buyerStock);

                BigDecimal itemTotal = stock.getBatch().getPurchasePrice().multiply(BigDecimal.valueOf(requestedQty));
                orderTotal = orderTotal.add(itemTotal);

                orderItemRepository.save(OrderItem.builder().order(order).batch(stock.getBatch()).quantity(requestedQty).price(stock.getBatch().getPurchasePrice()).build());
            }

            CreditAccount account = creditAccountRepository.findByRetailerId(buyer.getId())
                    .orElseGet(() -> creditAccountRepository.save(CreditAccount.builder().retailer(buyer).creditLimit(BigDecimal.valueOf(500000.00)).outstandingBalance(BigDecimal.ZERO).build()));

            BigDecimal availableCredit = account.getCreditLimit().subtract(account.getOutstandingBalance());
            if (availableCredit.compareTo(orderTotal) < 0) throw new RuntimeException("Insufficient credit limit.");

            account.setOutstandingBalance(account.getOutstandingBalance().add(orderTotal));
            creditAccountRepository.save(account);

            ledgerEntryRepository.save(LedgerEntry.builder().retailer(buyer).amount(orderTotal).transactionType("PURCHASE").description("B2B Order #" + order.getId() + " from " + seller.getName()).build());

            order.setTotalAmount(orderTotal);
            orderRepository.save(order);
        }
        return "Orders placed successfully!";
    }

    @Transactional(readOnly = true)
    public List<DistributorOrderResponse> getDistributorOrders(String sellerEmail) {
        User seller = userRepository.findByEmail(sellerEmail).orElseThrow();
        List<Order> orders = orderRepository.findBySellerIdOrderByCreatedAtDesc(seller.getId());

        return orders.stream()
                .filter(order -> !order.getStatus().equals("ARCHIVED")) // Hide archived orders
                .map(order -> {
                    List<DistributorOrderResponse.OrderItemDto> items = orderItemRepository.findByOrderId(order.getId()).stream()
                            .map(item -> DistributorOrderResponse.OrderItemDto.builder().medicineName(item.getBatch().getMedicine().getName()).batchNumber(item.getBatch().getBatchNumber()).quantity(item.getQuantity()).price(item.getPrice()).build()).collect(Collectors.toList());
                    return DistributorOrderResponse.builder().orderId(order.getId()).retailerName(order.getBuyer().getName()).retailerPhone(order.getBuyer().getPhone()).sellerName(order.getSeller().getName()).totalAmount(order.getTotalAmount()).status(order.getStatus()).orderDate(order.getCreatedAt()).items(items).build();
                }).collect(Collectors.toList());
    }

    @Transactional
    public String updateOrderStatus(Long orderId, String newStatus, String sellerEmail) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getSeller().getEmail().equals(sellerEmail)) throw new RuntimeException("Unauthorized action");
        order.setStatus(newStatus);
        orderRepository.save(order);
        return "Order status updated to " + newStatus;
    }

    // --- NEW RETAILER AND ARCHIVE METHODS ---

    @Transactional(readOnly = true)
    public List<DistributorOrderResponse> getRetailerOrders(String buyerEmail) {
        User buyer = userRepository.findByEmail(buyerEmail).orElseThrow();
        List<Order> orders = orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyer.getId());

        return orders.stream().map(order -> {
            List<DistributorOrderResponse.OrderItemDto> items = orderItemRepository.findByOrderId(order.getId()).stream()
                    .map(item -> DistributorOrderResponse.OrderItemDto.builder().medicineName(item.getBatch().getMedicine().getName()).batchNumber(item.getBatch().getBatchNumber()).quantity(item.getQuantity()).price(item.getPrice()).build()).collect(Collectors.toList());
            return DistributorOrderResponse.builder().orderId(order.getId()).retailerName(order.getBuyer().getName()).sellerName(order.getSeller().getName()).totalAmount(order.getTotalAmount()).status(order.getStatus()).orderDate(order.getCreatedAt()).items(items).build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public String archiveShippedOrders(String sellerEmail) {
        User seller = userRepository.findByEmail(sellerEmail).orElseThrow();
        List<Order> orders = orderRepository.findBySellerIdOrderByCreatedAtDesc(seller.getId());

        int count = 0;
        for (Order order : orders) {
            if ("SHIPPED".equals(order.getStatus())) {
                order.setStatus("ARCHIVED");
                orderRepository.save(order);
                count++;
            }
        }
        return count + " shipped orders cleared!";
    }
}