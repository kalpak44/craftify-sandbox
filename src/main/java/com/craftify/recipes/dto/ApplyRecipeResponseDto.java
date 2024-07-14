package com.craftify.recipes.dto;

import com.craftify.products.document.ProductDocument;
import java.math.BigDecimal;

public class ApplyRecipeResponseDto {
  private String recipeId;
  private int applyCount;
  private BigDecimal possibleProducts;
  private int productsProduced;

  private ProductDocument resultingProduct;

  public String getRecipeId() {
    return recipeId;
  }

  public void setRecipeId(String recipeId) {
    this.recipeId = recipeId;
  }

  public BigDecimal getPossibleProducts() {
    return possibleProducts;
  }

  public void setPossibleProducts(BigDecimal possibleProducts) {
    this.possibleProducts = possibleProducts;
  }

  public int getApplyCount() {
    return applyCount;
  }

  public void setApplyCount(int applyCount) {
    this.applyCount = applyCount;
  }

  public int getProductsProduced() {
    return productsProduced;
  }

  public void setProductsProduced(int productsProduced) {
    this.productsProduced = productsProduced;
  }

  public ProductDocument getResultingProduct() {
    return resultingProduct;
  }

  public void setResultingProduct(ProductDocument resultingProduct) {
    this.resultingProduct = resultingProduct;
  }
}
