package com.icake.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.icake.model.ItemAddonOptionSizePrice;

@Repository
public interface ItemAddonOptionSizePriceRepository extends JpaRepository<ItemAddonOptionSizePrice, Long> {
}
