package com.icake.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.icake.model.Order;
import com.icake.model.OrderStatus;

public interface OrderRepository extends JpaRepository<Order, Long> {

	@Query("""
			    SELECT o FROM Order o
			    JOIN FETCH o.client 
			    JOIN FETCH o.address a
			    JOIN FETCH a.city c
			    JOIN FETCH c.state
			    LEFT JOIN FETCH o.items i
			    LEFT JOIN FETCH i.item
			    WHERE o.id = :id
			""")
	Optional<Order> findByIdWithRelations(Long id);

	List<Order> findByStatus(OrderStatus status);
}

