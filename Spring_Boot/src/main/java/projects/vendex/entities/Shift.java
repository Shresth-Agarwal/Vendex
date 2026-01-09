package projects.vendex.entities;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "shifts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Shift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate shiftDate;

    private LocalTime startTime;
    private LocalTime endTime;

    private String requiredSkill;

    private Long assignedStaffId; // nullable

    private String status;
    // OPEN, OFFERED, ASSIGNED, COMPLETED
}
