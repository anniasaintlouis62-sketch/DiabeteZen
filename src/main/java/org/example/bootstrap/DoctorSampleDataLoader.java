package org.example.bootstrap;

import org.example.model.Doctor;
import org.example.repository.DoctorRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Order(100)
public class DoctorSampleDataLoader implements ApplicationRunner {
    private final DoctorRepository doctorRepository;

    public DoctorSampleDataLoader(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (doctorRepository.count() > 0) {
            return;
        }
        doctorRepository.save(build(
                "a1111111111111111111111111111111",
                "Dr Marie Saint-Louis",
                "Endocrinologie-diabétologie",
                "Delmas 33",
                "+509 48 56 78 32",
                "marie.saintlouis@example.ht",
                "Hôpital La Paix"));
        doctorRepository.save(build(
                "a2222222222222222222222222222222",
                "Dr Jean-Baptiste Pierre",
                "Diabétologie",
                "Pétion-Ville",
                "+509 32 54 67 90",
                null,
                "Centre Ephata"));
        doctorRepository.save(build(
                "a3333333333333333333333333333333",
                "Dr Aminata Bélizaire",
                "Diabétologie",
                "Route de Frères",
                "+509 48 65 22 36",
                "aminata.sante@example.ht",
                "Centre hospitalier Aminita"));
    }

    private static Doctor build(
            String id,
            String fullName,
            String specialty,
            String city,
            String phone,
            String email,
            String institution) {
        Doctor d = new Doctor();
        d.setId(id);
        d.setFullName(fullName);
        d.setSpecialty(specialty);
        d.setCity(city);
        d.setPhone(phone);
        d.setEmail(email);
        d.setInstitution(institution);
        return d;
    }
}
