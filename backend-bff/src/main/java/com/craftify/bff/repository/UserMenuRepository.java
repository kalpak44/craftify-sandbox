package com.craftify.bff.repository;

import com.craftify.bff.model.UserMenu;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserMenuRepository extends MongoRepository<UserMenu, String> {
  Optional<UserMenu> findByUserIdAndRoute(String userId, String route);

  List<UserMenu> findByUserId(String userId);
}
