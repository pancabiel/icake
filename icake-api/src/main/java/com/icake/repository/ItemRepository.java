package com.icake.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.icake.model.Item;

public interface ItemRepository extends JpaRepository<Item, Long> {

	List<Item> findByCategoryIdAndActiveTrue(Long categoryId);
}
