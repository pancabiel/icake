package com.icake.repository;

import com.icake.model.Address;
import com.icake.model.ClientAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ClientAddressRepository extends JpaRepository<ClientAddress, Long> {
    @Query("select a from ClientAddress ca join ca.address a join fetch a.city where ca.client.id = :clientId")
    List<Address> findByClientId(Long clientId);
}
