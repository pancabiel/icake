package com.icake.dto;

import com.icake.model.Item;
import jakarta.persistence.Column;

public class ItemDTO {

    private String name;

    private String picture;

    @Column(length = 1000)
    private String description;

    private double price;

    public ItemDTO(Item item) {
        this.name = item.getName();
        this.picture = item.getPicture();
        this.description = item.getDescription();
        this.price = item.getPrice();
    }

    public String getName() {
        return name;
    }

    public String getPicture() {
        return picture;
    }

    public String getDescription() {
        return description;
    }

    public double getPrice() {
        return price;
    }
}
