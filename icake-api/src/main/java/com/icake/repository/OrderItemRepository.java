package com.icake.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.icake.model.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

}
