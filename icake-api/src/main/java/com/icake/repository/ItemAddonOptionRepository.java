package com.icake.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.icake.model.ItemAddonOption;

@Repository
public interface ItemAddonOptionRepository extends JpaRepository<ItemAddonOption, Long> {

    List<ItemAddonOption> findByAddonId(Long addonId);
}