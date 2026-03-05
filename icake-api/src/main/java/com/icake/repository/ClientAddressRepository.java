package com.icake.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.icake.model.ClientAddress;

public interface ClientAddressRepository extends JpaRepository<ClientAddress, Long> {

	@Query("select ca from ClientAddress ca join fetch ca.address a join fetch a.city where ca.client.id = :clientId")
	List<ClientAddress> findByClientId(Long clientId);
}
