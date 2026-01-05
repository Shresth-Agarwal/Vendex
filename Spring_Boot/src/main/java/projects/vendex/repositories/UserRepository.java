package projects.vendex.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import projects.vendex.entities.User;
import projects.vendex.util.UserView;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    List<UserView> findAllBy();

    Boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);

    UserView findUserByEmail(String email);

    Optional<UserView> findUserById(long id);

}


