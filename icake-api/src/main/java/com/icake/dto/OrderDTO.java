package com.icake.dto;

import com.icake.model.Order;

import java.util.Date;

public class OrderDTO {
    private Long id;
    private String clientName;
    private Date date;

    public OrderDTO(Order order) {
        this.id = order.getId();
        this.clientName = order.getClient().getName(); // access safely
        this.date = order.getDate();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }
}
