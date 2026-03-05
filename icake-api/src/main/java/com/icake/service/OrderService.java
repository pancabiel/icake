package com.icake.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.icake.dto.OrderDTO;
import com.icake.model.Address;
import com.icake.model.Client;
import com.icake.model.ClientAddress;
import com.icake.model.Order;
import com.icake.model.OrderStatus;
import com.icake.repository.AddressRepository;
import com.icake.repository.ClientAddressRepository;
import com.icake.repository.ClientRepository;
import com.icake.repository.ItemRepository;
import com.icake.repository.OrderRepository;

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

	@Transactional(readOnly = true)
	public List<OrderDTO> findByStatus(OrderStatus status) {
		return orderRepository.findByStatus(status)
				.stream()
				.map(OrderDTO::new)
				.collect(Collectors.toList());
	}

	@Transactional
	public Order concludeOrder(Long id) {
		Order order = orderRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Order not found"));
		order.setStatus(OrderStatus.CONCLUDED);
		return orderRepository.save(order);
	}

	@Transactional
	public Order unconcludeOrder(Long id) {
		Order order = orderRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Order not found"));
		order.setStatus(OrderStatus.PENDING);
		return orderRepository.save(order);
	}

	@Transactional
	public Optional<Order> findById(Long id) {
		return orderRepository.findByIdWithRelations(id);
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
			clientAddress.setFavorite(true);
			clientAddressRepository.save(clientAddress);

			// Mark all other addresses as non-favorite
			markAddressAsFavorite(order.getClient(), address);
		} else {
			// Use reference for an existing address
			order.setAddress(addressRepository.getReferenceById(address.getId()));

			// Mark this address as favorite for the client
			markAddressAsFavorite(order.getClient(), address);
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
	private void markAddressAsFavorite(Client client, Address address) {
		// Get all client addresses
		List<ClientAddress> clientAddresses = clientAddressRepository.findAll().stream()
				.filter(ca -> ca.getClient().getId().equals(client.getId()))
				.toList();

		// Mark all as non-favorite
		for (ClientAddress ca : clientAddresses) {
			ca.setFavorite(false);
		}

		// Find or create the ClientAddress for this specific address and mark as favorite
		ClientAddress favoriteAddress = clientAddresses.stream()
				.filter(ca -> ca.getAddress().getId().equals(address.getId()))
				.findFirst()
				.orElse(null);

		if (favoriteAddress != null) {
			favoriteAddress.setFavorite(true);
			clientAddressRepository.save(favoriteAddress);
		}

		// Save all non-favorite ones
		clientAddresses.forEach(clientAddressRepository::save);
	}

	@Transactional
	public void deleteById(Long id) {
		orderRepository.deleteById(id);
	}
}