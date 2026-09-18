package com.civic.connect.repository;

import com.civic.connect.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailOrMobile(String email, String mobile);
    Boolean existsByEmail(String email);
    Boolean existsByMobile(String mobile);
    List<User> findByRoleName(String roleName);
    List<User> findByDistrictId(Long districtId);
}
