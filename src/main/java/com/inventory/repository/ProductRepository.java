package com.inventory.repository;

import com.inventory.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    List<Product> findByNameContainingIgnoreCaseOrCategoryContainingIgnoreCaseOrSupplierContainingIgnoreCase(
        String name, String category, String supplier);
    
    @Query("SELECT p FROM Product p WHERE p.quantity <= p.minStock")
    List<Product> findLowStockProducts();
    
    @Query("SELECT p FROM Product p WHERE p.quantity = 0")
    List<Product> findOutOfStockProducts();
    
    List<Product> findByCategory(String category);
    List<Product> findBySupplier(String supplier);
}
