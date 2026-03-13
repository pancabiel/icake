package com.icake.dto;

import com.icake.model.Order;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class OrderDTO {
    private Long id;
    private String clientName;
    private ClientInfo client;
    private AddressInfo address;
    private LocalDateTime dateTime;
    private String status;
    private List<OrderItemDTO> items;

    public OrderDTO(Order order) {
        this.id = order.getId();
        this.clientName = order.getClient().getName();
        this.client = new ClientInfo(order.getClient().getId(), order.getClient().getName());
        this.address = new AddressInfo(
                order.getAddress().getId(),
                order.getAddress().getResume(),
                order.getAddress().getStreet(),
                order.getAddress().getNumber(),
                order.getAddress().getComplement(),
                order.getAddress().getZipCode()
        );
        this.dateTime = order.getDateTime();
        this.status = order.getStatus().name();
        this.items = order.getItems()
                .stream()
                .distinct()
                .map(OrderItemDTO::new)
                .collect(Collectors.toList());
    }

    public Long getId() {
        return id;
    }

    public String getClientName() {
        return clientName;
    }

    public ClientInfo getClient() {
        return client;
    }

    public AddressInfo getAddress() {
        return address;
    }

    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }

    public String getStatus() {
        return status;
    }

    public List<OrderItemDTO> getItems() {
        return items;
    }

    // Nested DTOs for client and address
    public static class ClientInfo {
        private Long id;
        private String name;

        public ClientInfo(Long id, String name) {
            this.id = id;
            this.name = name;
        }

        public Long getId() { return id; }
        public String getName() { return name; }
    }

    public static class AddressInfo {
        private Long id;
        private String resume;
        private String street;
        private String number;
        private String complement;
        private String zipCode;

        public AddressInfo(Long id, String resume, String street, String number, String complement, String zipCode) {
            this.id = id;
            this.resume = resume;
            this.street = street;
            this.number = number;
            this.complement = complement;
            this.zipCode = zipCode;
        }

        public Long getId() { return id; }
        public String getResume() { return resume; }
        public String getStreet() { return street; }
        public String getNumber() { return number; }
        public String getComplement() { return complement; }
        public String getZipCode() { return zipCode; }
    }
}