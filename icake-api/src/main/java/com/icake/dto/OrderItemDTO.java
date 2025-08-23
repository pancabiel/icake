package com.icake.dto;

import com.icake.model.OrderItem;

public class OrderItemDTO {
    private Long id;
    private int quantity;
    private String note;
    private ItemDTO item;

    public OrderItemDTO(OrderItem orderItem) {
        this.id = orderItem.getId();
        this.quantity = orderItem.getQuantity();
        this.note = orderItem.getNote();
        this.item = new ItemDTO(orderItem.getItem());
    }

    public Long getId() { return id; }
    public ItemDTO getItem() { return item; }
    public int getQuantity() { return quantity; }
    public String getNote() { return note; }
}