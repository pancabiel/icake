package com.icake.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.icake.model.ItemAddon;

@Repository
public interface ItemAddonRepository extends JpaRepository<ItemAddon, Long> {

    List<ItemAddon> findByItemId(Long itemId);
}