package com.civic.connect.repository;

import com.civic.connect.model.Worker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkerRepository extends JpaRepository<Worker, Long> {
    Optional<Worker> findByUserId(Long userId);
    List<Worker> findByDistrictIdAndDepartmentId(Long districtId, Long departmentId);
}
