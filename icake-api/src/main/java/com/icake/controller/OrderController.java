package com.icake.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.icake.dto.OrderDTO;
import com.icake.model.Order;
import com.icake.model.OrderStatus;
import com.icake.service.OrderService;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
	private final OrderService orderService;

	public OrderController(OrderService orderService) {
		this.orderService = orderService;
	}

	@GetMapping
	public List<OrderDTO> getAll(@RequestParam(required = false) String status) {
		if (status != null) {
			return orderService.findByStatus(OrderStatus.valueOf(status));
		}
		return orderService.findAll();
	}

	@GetMapping("/{id}")
	public ResponseEntity<OrderDTO> getById(@PathVariable Long id) {
		return orderService.findById(id)
				.map(o -> ResponseEntity.ok(new OrderDTO(o)))
				.orElse(ResponseEntity.notFound().build());
	}

	@PostMapping
	public OrderDTO create(@RequestBody Order order) {
		Order saved = orderService.save(order);
		return new OrderDTO(saved);
	}

	@PutMapping("/{id}")
	public ResponseEntity<OrderDTO> update(@PathVariable Long id, @RequestBody Order order) {
		if (orderService.findById(id).isEmpty()) {
			return ResponseEntity.notFound().build();
		}
		order.setId(id);
		return ResponseEntity.ok(new OrderDTO(orderService.save(order)));
	}

	@PatchMapping("/{id}/conclude")
	public ResponseEntity<Void> conclude(@PathVariable Long id) {
		try {
			orderService.concludeOrder(id);
			return ResponseEntity.noContent().build();
		} catch (RuntimeException e) {
			return ResponseEntity.notFound().build();
		}
	}

	@PatchMapping("/{id}/unconclude")
	public ResponseEntity<Void> unconclude(@PathVariable Long id) {
		try {
			orderService.unconcludeOrder(id);
			return ResponseEntity.noContent().build();
		} catch (RuntimeException e) {
			return ResponseEntity.notFound().build();
		}
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		if (orderService.findById(id).isEmpty()) {
			return ResponseEntity.notFound().build();
		}
		orderService.deleteById(id);
		return ResponseEntity.noContent().build();
	}
}
