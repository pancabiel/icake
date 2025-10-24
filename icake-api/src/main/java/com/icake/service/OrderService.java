package com.icake.service;

import com.icake.dto.OrderDTO;
import com.icake.model.Order;
import com.icake.repository.AddressRepository;
import com.icake.repository.ClientRepository;
import com.icake.repository.ItemRepository;
import com.icake.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final ClientRepository clientRepository;
    private final AddressRepository addressRepository;
    private final ItemRepository itemRepository;

    public OrderService(OrderRepository orderRepository,
                        ClientRepository clientRepository,
                        AddressRepository addressRepository,
                        ItemRepository itemRepository) {
        this.orderRepository = orderRepository;
        this.clientRepository = clientRepository;
        this.addressRepository = addressRepository;
        this.itemRepository = itemRepository;
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> findAll() {
        return orderRepository.findAll()
                .stream()
                .map(OrderDTO::new)
                .collect(Collectors.toList());
    }

    public Optional<Order> findById(Long id) {
        return orderRepository.findById(id);
    }

    @Transactional
    public Order save(Order order) {
        // Fetch references instead of using detached entities
        order.setClient(clientRepository.getReferenceById(order.getClient().getId()));
        order.setAddress(addressRepository.getReferenceById(order.getAddress().getId()));

        // Ensure each OrderItem points to the Order and has managed Item references
        if (order.getItems() != null) {
            order.getItems().forEach(oi -> {
                oi.setOrder(order);
                oi.setItem(itemRepository.getReferenceById(oi.getItem().getId()));
            });
        }

        Order saved = orderRepository.save(order);

        // Return a fully initialized version
        return orderRepository.findByIdWithRelations(saved.getId()).orElseThrow();
    }

    @Transactional
    public void deleteById(Long id) {
        orderRepository.deleteById(id);
    }
}