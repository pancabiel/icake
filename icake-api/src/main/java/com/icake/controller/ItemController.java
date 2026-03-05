package com.icake.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.icake.model.Item;
import com.icake.service.ItemService;

@RestController
@RequestMapping("/api/items")
public class ItemController {
	private final ItemService itemService;

	public ItemController(ItemService itemService) {
		this.itemService = itemService;
	}

	@GetMapping
	public List<Item> getAll() {
		return itemService.findAll();
	}

	@GetMapping("/{id}")
	public ResponseEntity<Item> getById(@PathVariable Long id) {
		return itemService.findById(id)
				.map(ResponseEntity::ok)
				.orElse(ResponseEntity.notFound().build());
	}

	@PostMapping
	public Item create(@RequestBody Item item) {
		return itemService.save(item);
	}

	@PutMapping("/{id}")
	public ResponseEntity<Item> update(@PathVariable Long id, @RequestBody Item item) {
		if (itemService.findById(id).isEmpty()) {
			return ResponseEntity.notFound().build();
		}
		item.setId(id);
		return ResponseEntity.ok(itemService.save(item));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		if (itemService.findById(id).isEmpty()) {
			return ResponseEntity.notFound().build();
		}
		itemService.deleteById(id);
		return ResponseEntity.noContent().build();
	}
}
