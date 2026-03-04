package com.icake.dto;

import com.icake.model.Order;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class OrderDTO {
    private Long id;
    private String clientName;
    private String address;
    private LocalDateTime dateTime;
    private List<OrderItemDTO> items;

    public OrderDTO(Order order) {
        this.id = order.getId();
        this.clientName = order.getClient().getName();
        this.address = order.getAddress().toString();
        this.dateTime = order.getDateTime();
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

    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }

    public List<OrderItemDTO> getItems() {
        return items;
    }
}