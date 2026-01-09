package projects.vendex.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Entity
@Table(name = "staff")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Staff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String role;

    @ElementCollection
    @CollectionTable(name = "staff_skills", joinColumns = @JoinColumn(name = "staff_id"))
    @Column(name = "skill")
    private Set<String> skills;

    private double hourlyRate;

    private boolean active;
}
