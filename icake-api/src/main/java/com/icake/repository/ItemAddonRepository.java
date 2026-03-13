package com.icake.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.icake.model.ItemAddon;

@Repository
public interface ItemAddonRepository extends JpaRepository<ItemAddon, Long> {

    @Query("SELECT DISTINCT a FROM ItemAddon a LEFT JOIN FETCH a.options AS opt WHERE a.item.id = :itemId")
    List<ItemAddon> findByItemId(Long itemId);
}