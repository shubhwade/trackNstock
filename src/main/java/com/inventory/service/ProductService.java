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
        // Search by name or category or supplier (brand)
        return productRepository.findByNameContainingIgnoreCaseOrCategoryContainingIgnoreCaseOrSupplierContainingIgnoreCase(
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
    
    public List<String> getAllCategories() {
        return productRepository.findAll().stream()
            .map(Product::getCategory)
            .distinct()
            .sorted()
            .toList();
    }
    
    public List<String> getAllSuppliers() {
        return productRepository.findAll().stream()
            .map(Product::getSupplier)
            .distinct()
            .sorted()
            .toList();
    }
    
    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategory(category);
    }
    
    public List<Product> getProductsBySupplier(String supplier) {
        return productRepository.findBySupplier(supplier);
    }
}
