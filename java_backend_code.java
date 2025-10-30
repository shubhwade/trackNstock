// File: src/main/java/com/inventory/InventoryManagementApplication.java
package com.inventory;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class InventoryManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(InventoryManagementApplication.class, args);
    }
}

// File: src/main/java/com/inventory/model/Product.java
package com.inventory.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, unique = true)
    private String sku;
    
    @Column(nullable = false)
    private String category;
    
    @Column(nullable = false)
    private Integer quantity;
    
    @Column(nullable = false)
    private Integer minStock;
    
    @Column(nullable = false)
    private Double price;
    
    @Column(nullable = false)
    private String supplier;
    
    @Column(nullable = false)
    private LocalDateTime lastUpdated;
    
    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDateTime.now();
    }
    
    // Constructors
    public Product() {}
    
    public Product(String name, String sku, String category, Integer quantity, 
                   Integer minStock, Double price, String supplier) {
        this.name = name;
        this.sku = sku;
        this.category = category;
        this.quantity = quantity;
        this.minStock = minStock;
        this.price = price;
        this.supplier = supplier;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    
    public Integer getMinStock() { return minStock; }
    public void setMinStock(Integer minStock) { this.minStock = minStock; }
    
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    
    public String getSupplier() { return supplier; }
    public void setSupplier(String supplier) { this.supplier = supplier; }
    
    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}

// File: src/main/java/com/inventory/repository/ProductRepository.java
package com.inventory.repository;

import com.inventory.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    List<Product> findByNameContainingIgnoreCaseOrSkuContainingIgnoreCaseOrCategoryContainingIgnoreCase(
        String name, String sku, String category);
    
    @Query("SELECT p FROM Product p WHERE p.quantity <= p.minStock")
    List<Product> findLowStockProducts();
    
    @Query("SELECT p FROM Product p WHERE p.quantity = 0")
    List<Product> findOutOfStockProducts();
    
    List<Product> findByCategory(String category);
}

// File: src/main/java/com/inventory/service/ProductService.java
package com.inventory.service;

import com.inventory.model.Product;
import com.inventory.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }
    
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }
    
    public Product updateProduct(Long id, Product productDetails) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        
        product.setName(productDetails.getName());
        product.setSku(productDetails.getSku());
        product.setCategory(productDetails.getCategory());
        product.setQuantity(productDetails.getQuantity());
        product.setMinStock(productDetails.getMinStock());
        product.setPrice(productDetails.getPrice());
        product.setSupplier(productDetails.getSupplier());
        
        return productRepository.save(product);
    }
    
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
    
    public List<Product> searchProducts(String searchTerm) {
        return productRepository.findByNameContainingIgnoreCaseOrSkuContainingIgnoreCaseOrCategoryContainingIgnoreCase(
            searchTerm, searchTerm, searchTerm);
    }
    
    public List<Product> getLowStockProducts() {
        return productRepository.findLowStockProducts();
    }
    
    public List<Product> getOutOfStockProducts() {
        return productRepository.findOutOfStockProducts();
    }
    
    public Double getTotalInventoryValue() {
        return productRepository.findAll().stream()
            .mapToDouble(p -> p.getQuantity() * p.getPrice())
            .sum();
    }
}

// File: src/main/java/com/inventory/controller/ProductController.java
package com.inventory.controller;

import com.inventory.model.Product;
import com.inventory.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {
    
    @Autowired
    private ProductService productService;
    
    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        Product savedProduct = productService.createProduct(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedProduct);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        try {
            Product updatedProduct = productService.updateProduct(id, product);
            return ResponseEntity.ok(updatedProduct);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam String query) {
        return productService.searchProducts(query);
    }
    
    @GetMapping("/low-stock")
    public List<Product> getLowStockProducts() {
        return productService.getLowStockProducts();
    }
    
    @GetMapping("/out-of-stock")
    public List<Product> getOutOfStockProducts() {
        return productService.getOutOfStockProducts();
    }
    
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProducts", productService.getAllProducts().size());
        stats.put("lowStockCount", productService.getLowStockProducts().size());
        stats.put("outOfStockCount", productService.getOutOfStockProducts().size());
        stats.put("totalValue", productService.getTotalInventoryValue());
        return ResponseEntity.ok(stats);
    }
}

// File: src/main/java/com/inventory/config/CorsConfig.java
package com.inventory.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}