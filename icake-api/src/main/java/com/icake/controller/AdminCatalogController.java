package com.icake.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.icake.model.AddonType;
import com.icake.model.Category;
import com.icake.model.Item;
import com.icake.model.ItemAddon;
import com.icake.model.ItemAddonOption;
import com.icake.repository.CategoryRepository;
import com.icake.repository.ItemAddonOptionRepository;
import com.icake.repository.ItemAddonRepository;
import com.icake.repository.ItemRepository;

@RestController
@RequestMapping("/api")
public class AdminCatalogController {

    private final CategoryRepository categoryRepository;
    private final ItemRepository itemRepository;
    private final ItemAddonRepository addonRepository;
    private final ItemAddonOptionRepository optionRepository;

    public AdminCatalogController(
            CategoryRepository categoryRepository,
            ItemRepository itemRepository,
            ItemAddonRepository addonRepository,
            ItemAddonOptionRepository optionRepository
    ) {
        this.categoryRepository = categoryRepository;
        this.itemRepository = itemRepository;
        this.addonRepository = addonRepository;
        this.optionRepository = optionRepository;
    }

    // ─── Categories ───────────────────────────────────────────────────────────

    @GetMapping("/categories")
    public List<Category> getCategories() {
        return categoryRepository.findAll();
    }

    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@RequestBody Map<String, Object> body) {
        Category category = new Category();
        applyCategory(category, body);
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return categoryRepository.findById(id).map(category -> {
            applyCategory(category, body);
            return ResponseEntity.ok(categoryRepository.save(category));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        if (!categoryRepository.existsById(id)) return ResponseEntity.notFound().build();
        categoryRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void applyCategory(Category c, Map<String, Object> body) {
        if (body.get("name") != null) c.setName((String) body.get("name"));
        if (body.get("emoji") != null) c.setEmoji((String) body.get("emoji"));
        if (body.get("sortOrder") != null) c.setSortOrder(((Number) body.get("sortOrder")).intValue());
        if (body.get("active") != null) c.setActive((Boolean) body.get("active"));
    }

    // ─── Items ────────────────────────────────────────────────────────────────

    @GetMapping("/items")
    public List<Item> getItems() {
        return itemRepository.findAll();
    }

    @GetMapping("/items/{id}")
    public ResponseEntity<Item> getItemById(@PathVariable Long id) {
        return itemRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/items")
    public ResponseEntity<Item> createItem(@RequestBody Map<String, Object> body) {
        Item item = new Item();
        applyItem(item, body);
        return ResponseEntity.ok(itemRepository.save(item));
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<Item> updateItem(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return itemRepository.findById(id).map(item -> {
            applyItem(item, body);
            return ResponseEntity.ok(itemRepository.save(item));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        if (!itemRepository.existsById(id)) return ResponseEntity.notFound().build();
        itemRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void applyItem(Item item, Map<String, Object> body) {
        if (body.get("name") != null) item.setName((String) body.get("name"));
        if (body.get("description") != null) item.setDescription((String) body.get("description"));
        if (body.get("emoji") != null) item.setEmoji((String) body.get("emoji"));
        if (body.get("picture") != null) item.setPicture((String) body.get("picture"));
        if (body.get("unit") != null) item.setUnit((String) body.get("unit"));
        if (body.get("price") != null) item.setPrice(((Number) body.get("price")).doubleValue());
        if (body.get("minQty") != null) item.setMinQty(((Number) body.get("minQty")).intValue());
        if (body.get("active") != null) item.setActive((Boolean) body.get("active"));
        if (body.get("categoryId") != null) {
            Long categoryId = ((Number) body.get("categoryId")).longValue();
            categoryRepository.findById(categoryId).ifPresent(item::setCategory);
        }
    }

    // ─── Addons ───────────────────────────────────────────────────────────────

    @PostMapping("/addons")
    public ResponseEntity<ItemAddon> createAddon(@RequestBody Map<String, Object> body) {
        Long itemId = ((Number) body.get("itemId")).longValue();
        return itemRepository.findById(itemId).map(item -> {
            ItemAddon addon = new ItemAddon();
            addon.setItem(item);
            applyAddon(addon, body);
            return ResponseEntity.ok(addonRepository.save(addon));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/addons/{id}")
    public ResponseEntity<ItemAddon> updateAddon(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return addonRepository.findById(id).map(addon -> {
            applyAddon(addon, body);
            return ResponseEntity.ok(addonRepository.save(addon));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/addons/{id}")
    public ResponseEntity<Void> deleteAddon(@PathVariable Long id) {
        if (!addonRepository.existsById(id)) return ResponseEntity.notFound().build();
        addonRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void applyAddon(ItemAddon addon, Map<String, Object> body) {
        if (body.get("label") != null) addon.setLabel((String) body.get("label"));
        if (body.get("type") != null) addon.setType(AddonType.valueOf((String) body.get("type")));
        if (body.get("required") != null) addon.setRequired((Boolean) body.get("required"));
        if (body.containsKey("maxSelections")) {
            addon.setMaxSelections(body.get("maxSelections") != null
                    ? ((Number) body.get("maxSelections")).intValue()
                    : null);
        }
    }

    // ─── Addon Options ────────────────────────────────────────────────────────

    @PostMapping("/addon-options")
    public ResponseEntity<ItemAddonOption> createOption(@RequestBody Map<String, Object> body) {
        Long addonId = ((Number) body.get("addonId")).longValue();
        return addonRepository.findById(addonId).map(addon -> {
            ItemAddonOption option = new ItemAddonOption();
            option.setAddon(addon);
            applyOption(option, body);
            return ResponseEntity.ok(optionRepository.save(option));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/addon-options/{id}")
    public ResponseEntity<ItemAddonOption> updateOption(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return optionRepository.findById(id).map(option -> {
            applyOption(option, body);
            return ResponseEntity.ok(optionRepository.save(option));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/addon-options/{id}")
    public ResponseEntity<Void> deleteOption(@PathVariable Long id) {
        if (!optionRepository.existsById(id)) return ResponseEntity.notFound().build();
        optionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void applyOption(ItemAddonOption option, Map<String, Object> body) {
        if (body.get("label") != null) option.setLabel((String) body.get("label"));
        if (body.get("priceDelta") != null) option.setPriceDelta(((Number) body.get("priceDelta")).doubleValue());
        if (body.get("active") != null) option.setActive((Boolean) body.get("active"));
    }

    // ── Item Addons ───────────────────────────────────────────────────────────────

    @GetMapping("/items/{id}/addons")
    public ResponseEntity<List<ItemAddon>> getItemAddons(@PathVariable Long id) {
        if (!itemRepository.existsById(id)) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(addonRepository.findByItemId(id));
    }
}