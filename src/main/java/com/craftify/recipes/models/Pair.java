package com.craftify.recipes.models;


public class Pair<V, U> {
  private V value;
  private U unit;

  public Pair() {
  }

  public Pair(V value, U unit) {
    this.value = value;
    this.unit = unit;
  }

  public V getValue() {
    return value;
  }

  public void setValue(V value) {
    this.value = value;
  }

  public U getUnit() {
    return unit;
  }

  public void setUnit(U unit) {
    this.unit = unit;
  }
}
