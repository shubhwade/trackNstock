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

        @GetMapping("/categories")
        public List<String> getAllCategories() {
            return productService.getAllCategories();
        }
    
        @GetMapping("/suppliers")
        public List<String> getAllSuppliers() {
            return productService.getAllSuppliers();
        }
    
        @GetMapping("/by-category/{category}")
        public List<Product> getProductsByCategory(@PathVariable String category) {
            return productService.getProductsByCategory(category);
        }
    
        @GetMapping("/by-supplier/{supplier}")
        public List<Product> getProductsBySupplier(@PathVariable String supplier) {
            return productService.getProductsBySupplier(supplier);
        }
}
