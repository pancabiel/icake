package com.icake.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.icake.model.City;
import com.icake.service.CityService;

@RestController
@RequestMapping("/api/cities")
public class CityController {

	private final CityService cityService;

	public CityController(CityService cityService) {
		this.cityService = cityService;
	}

	@GetMapping
	public List<City> getAll() {
		return cityService.findAll();
	}
}