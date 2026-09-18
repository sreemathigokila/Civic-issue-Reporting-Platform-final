package com.civic.connect.repository;

import com.civic.connect.model.DepartmentHead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DepartmentHeadRepository extends JpaRepository<DepartmentHead, Long> {
    Optional<DepartmentHead> findByDistrictIdAndDepartmentId(Long districtId, Long departmentId);
    Optional<DepartmentHead> findByUserId(Long userId);
}
