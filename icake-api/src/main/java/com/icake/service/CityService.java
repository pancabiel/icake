package com.icake.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.icake.model.City;
import com.icake.repository.CityRepository;

@Service
public class CityService {

	private final CityRepository cityRepository;

	public CityService(CityRepository cityRepository) {
		this.cityRepository = cityRepository;
	}

	@Transactional(readOnly = true)
	public List<City> findAll() {
		return cityRepository.findAllWithRelations();
	}
}