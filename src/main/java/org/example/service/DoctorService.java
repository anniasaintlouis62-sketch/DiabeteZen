package org.example.service;

import org.example.dto.DoctorResponse;
import org.example.repository.DoctorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DoctorService {
    private final DoctorRepository doctorRepository;

    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    @Transactional(readOnly = true)
    public List<DoctorResponse> listAll() {
        return doctorRepository.findAllByOrderByFullNameAsc().stream()
                .map(d -> new DoctorResponse(
                        d.getId(),
                        d.getFullName(),
                        d.getSpecialty(),
                        d.getCity(),
                        d.getPhone(),
                        d.getEmail(),
                        d.getInstitution(),
                        d.getCreatedAt()
                ))
                .toList();
    }
}
