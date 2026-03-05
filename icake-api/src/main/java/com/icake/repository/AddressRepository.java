package com.icake.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.icake.model.Address;

public interface AddressRepository extends JpaRepository<Address, Long> {
}
