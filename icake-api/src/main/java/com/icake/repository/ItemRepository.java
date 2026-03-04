package com.icake.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.icake.model.Item;

public interface ItemRepository extends JpaRepository<Item, Long> {

}
