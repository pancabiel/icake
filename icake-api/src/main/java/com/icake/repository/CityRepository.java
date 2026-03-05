package com.icake.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.icake.model.City;

public interface CityRepository extends JpaRepository<City, Long> {

	@Query("""
			    SELECT c FROM City c
			    JOIN FETCH c.state
			""")
	List<City> findAllWithRelations();
}
