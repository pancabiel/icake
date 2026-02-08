package com.icake.service;

import com.icake.dto.OrderDTO;
import com.icake.model.Address;
import com.icake.model.Client;
import com.icake.model.ClientAddress;
import com.icake.model.Order;
import com.icake.repository.AddressRepository;
import com.icake.repository.ClientRepository;
import com.icake.repository.ItemRepository;
import com.icake.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.icake.repository.ClientAddressRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final ClientRepository clientRepository;
    private final AddressRepository addressRepository;
    private final ItemRepository itemRepository;
    private final ClientAddressRepository clientAddressRepository;

    public OrderService(OrderRepository orderRepository,
                        ClientRepository clientRepository,
                        AddressRepository addressRepository,
                        ItemRepository itemRepository,
                        ClientAddressRepository clientAddressRepository) {
        this.orderRepository = orderRepository;
        this.clientRepository = clientRepository;
        this.addressRepository = addressRepository;
        this.itemRepository = itemRepository;
        this.clientAddressRepository = clientAddressRepository;
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
        // Handle client - if no ID, it's a new client
        Client client = order.getClient();
        if (client.getId() == null) {
            // Save the new client first
            client = clientRepository.save(client);
            order.setClient(client);
        } else {
            // Use reference for existing client
            order.setClient(clientRepository.getReferenceById(client.getId()));
        }
        
        // Handle address - if no ID, it's a new address
        Address address = order.getAddress();
        if (address.getId() == null) {
            // Save the new address first
            address = addressRepository.save(address);
            order.setAddress(address);
            
            // Create the client-address relationship if it's a new address
            ClientAddress clientAddress = new ClientAddress();
            clientAddress.setClient(order.getClient());
            clientAddress.setAddress(address);
            clientAddressRepository.save(clientAddress);
        } else {
            // Use reference for an existing address
            order.setAddress(addressRepository.getReferenceById(address.getId()));
        }

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