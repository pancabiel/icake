package com.icake.repository;

import com.icake.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("""
    SELECT o FROM Order o
    JOIN FETCH o.client
    JOIN FETCH o.address
    LEFT JOIN FETCH o.items i
    LEFT JOIN FETCH i.item
    WHERE o.id = :id
""")
    Optional<Order> findByIdWithRelations(Long id);
}
