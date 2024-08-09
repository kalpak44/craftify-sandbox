package com.craftify.recipes.service.commons.merge;

public interface MergeStrategy<T> {
  T merge(T original, T toMerge);
}
