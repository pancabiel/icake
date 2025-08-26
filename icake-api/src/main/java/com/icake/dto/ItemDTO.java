package com.icake.dto;

import com.icake.model.Item;

public class ItemDTO {

    private String name;
    private String picture;
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
