package com.icake.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.icake.model.State;

public interface StateRepository extends JpaRepository<State, Long> {

}
