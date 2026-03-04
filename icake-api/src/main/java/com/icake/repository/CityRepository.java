package com.icake.repository;

import com.icake.model.City;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CityRepository extends JpaRepository<City, Long> {

    @Query("""
    SELECT c FROM City c
    JOIN FETCH c.state
""")
    List<City> findAllWithRelations();
}
