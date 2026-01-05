package projects.vendex.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.boot.CommandLineRunner;
import projects.vendex.entities.Roles;
import projects.vendex.entities.User;
import projects.vendex.repositories.UserRepository;

@SuppressWarnings("unused")
@Slf4j
@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(12);
    private final Environment env;

    public DataInitializer(UserRepository userRepository, Environment env) {
        this.userRepository = userRepository;
        this.env = env;
    }

    @Override
    public void run(String... args) {
        createDefaultAdmin();
        createDefaultUser();
    }

    private void createDefaultAdmin() {
        String adminEmail = env.getProperty("DEFAULT_ADMIN_EMAIL");
        String adminPassword = env.getProperty("DEFAULT_ADMIN_PASSWORD");

        if (adminEmail != null && adminPassword != null && !userRepository.existsByEmail(adminEmail)) {
            User admin = new User();
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole(Roles.ADMIN);
            admin.setUsername("Admin");
            admin.setProvider("LOCAL");
            admin.setProviderId("LOCAL_" + adminEmail);
            userRepository.save(admin);
            log.info("Default admin created: {}", adminEmail);
        } else {
            log.info("ℹ No default admin created (missing env vars or already exists)");
        }
    }

    private void createDefaultUser() {
        String userEmail = env.getProperty("DEFAULT_USER_EMAIL");
        String userPassword = env.getProperty("DEFAULT_USER_PASSWORD");

        if (userEmail != null && userPassword != null && !userRepository.existsByEmail(userEmail)) {
            User user = new User();
            user.setEmail(userEmail);
            user.setPassword(passwordEncoder.encode(userPassword));
            user.setRole(Roles.USER);
            user.setUsername("User");
            user.setProvider("LOCAL");
            user.setProviderId("LOCAL_" + userEmail);
            userRepository.save(user);
            log.info("Default user created: {}", userEmail);
        } else {
            log.info("ℹ No default user created (missing env vars or already exists)");
        }
    }
}