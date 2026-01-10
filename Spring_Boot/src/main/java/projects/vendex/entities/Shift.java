package projects.vendex.entities;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "shifts")
@Getter
@Setter
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

    private Long assignedStaffId;

    private String status;
}
