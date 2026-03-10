package com.icake.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.icake.dto.CatalogDTO.CatalogResponse;
import com.icake.repository.CategoryRepository;

@RestController
@RequestMapping("/api/catalog")
public class CatalogController {

    private final CategoryRepository categoryRepository;

    public CatalogController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public ResponseEntity<CatalogResponse> getCatalog() {
        var categories = categoryRepository.findAllActiveWithItems();
        return ResponseEntity.ok(CatalogResponse.from(categories));
    }
}