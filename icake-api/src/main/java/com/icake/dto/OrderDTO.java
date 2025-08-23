package com.icake.dto;

import com.icake.model.Order;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

public class OrderDTO {
    private Long id;
    private String clientName;
    private String address;
    private Date date;
    private List<OrderItemDTO> items;

    public OrderDTO(Order order) {
        this.id = order.getId();
        this.clientName = order.getClient().getName();
        this.address = order.getAddress().toString();
        this.date = order.getDate();
        this.items = order.getItems()
                .stream()
                .map(OrderItemDTO::new)
                .collect(Collectors.toList());
    }

    public Long getId() {
        return id;
    }

    public String getClientName() {
        return clientName;
    }

    public String getAddress() {
        return address;
    }

    public Date getDate() {
        return date;
    }

    public List<OrderItemDTO> getItems() {
        return items;
    }
}
