package utm.server.modules.shops;

import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.ArrayList;

@Repository
public interface ShopRepository extends JpaRepository<ShopEntity, Long> {
    ArrayList<ShopEntity> findByName(String name);
    @NotNull ArrayList<ShopEntity> findAll();

    boolean existsByUser_Id(Long userId);
    java.util.Optional<ShopEntity> findByUuid(java.util.UUID uuid);
    java.util.List<ShopEntity> findByUuidIsNull();

}
