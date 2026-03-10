package com.icake.dto;

import java.util.List;

import com.icake.model.AddonType;
import com.icake.model.Category;
import com.icake.model.Item;
import com.icake.model.ItemAddon;
import com.icake.model.ItemAddonOption;

public class CatalogDTO {

    // ─── Root response ────────────────────────────────────────────────────────

    public record CatalogResponse(List<CategoryDTO> categories) {
        public static CatalogResponse from(List<Category> categories) {
            return new CatalogResponse(
                categories.stream().map(CategoryDTO::from).toList()
            );
        }
    }

    // ─── Category ─────────────────────────────────────────────────────────────

    public record CategoryDTO(
        Long id,
        String name,
        String emoji,
        List<ItemDTO> products
    ) {
        public static CategoryDTO from(Category c) {
            List<ItemDTO> products = c.getItems() == null
                ? List.of()
                : c.getItems().stream().filter(Item::isActive).map(ItemDTO::from).toList();
            return new CategoryDTO(c.getId(), c.getName(), c.getEmoji(), products);
        }
    }

    // ─── Item ─────────────────────────────────────────────────────────────────

    public record ItemDTO(
        Long id,
        String name,
        String description,
        String emoji,
        String picture,
        double basePrice,
        String unit,
        int minQty,
        List<AddonDTO> addons
    ) {
        public static ItemDTO from(Item i) {
            List<AddonDTO> addons = i.getAddons() == null
                ? List.of()
                : i.getAddons().stream().map(AddonDTO::from).toList();
            return new ItemDTO(
                i.getId(), i.getName(), i.getDescription(),
                i.getEmoji(), i.getPicture(), i.getPrice(),
                i.getUnit(), i.getMinQty(), addons
            );
        }
    }

    // ─── Addon group ──────────────────────────────────────────────────────────

    public record AddonDTO(
        Long id,
        String label,
        AddonType type,
        boolean required,
        Integer maxSelections,
        List<AddonOptionDTO> options
    ) {
        public static AddonDTO from(ItemAddon a) {
            List<AddonOptionDTO> options = a.getOptions() == null
                ? List.of()
                : a.getOptions().stream()
                    .filter(ItemAddonOption::isActive)
                    .map(AddonOptionDTO::from).toList();
            return new AddonDTO(
                a.getId(), a.getLabel(), a.getType(),
                a.isRequired(), a.getMaxSelections(), options
            );
        }
    }

    // ─── Addon option ─────────────────────────────────────────────────────────

    public record AddonOptionDTO(
        Long id,
        String label,
        double priceDelta
    ) {
        public static AddonOptionDTO from(ItemAddonOption o) {
            return new AddonOptionDTO(o.getId(), o.getLabel(), o.getPriceDelta());
        }
    }
}