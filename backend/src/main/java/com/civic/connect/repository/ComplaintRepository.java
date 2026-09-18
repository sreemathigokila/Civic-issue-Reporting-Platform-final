package com.civic.connect.repository;

import com.civic.connect.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long>, JpaSpecificationExecutor<Complaint> {
    Optional<Complaint> findByComplaintCode(String complaintCode);
    Optional<Complaint> findByComplaintCodeIgnoreCase(String complaintCode);
    List<Complaint> findByComplaintCodeContainingIgnoreCase(String codeSnippet);
    List<Complaint> findByCitizenId(Long citizenId);
    List<Complaint> findByDepartmentHeadId(Long departmentHeadId);
    List<Complaint> findByWorkerId(Long workerId);
    List<Complaint> findByDistrictIdAndDepartmentId(Long districtId, Long departmentId);
}
