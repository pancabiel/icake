package com.icake.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.icake.model.Client;

public interface ClientRepository extends JpaRepository<Client, Long> {

}
