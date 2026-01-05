package projects.vendex.services;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import projects.vendex.auth.jwt.dtos.JwtResponseDto;
import projects.vendex.auth.jwt.dtos.LoginDto;
import projects.vendex.auth.jwt.refresh_tokens.RefreshToken;
import projects.vendex.auth.jwt.refresh_tokens.RefreshTokenService;
import projects.vendex.entities.User;
import projects.vendex.repositories.UserRepository;
import projects.vendex.dtos.UserDto;
import projects.vendex.util.UserMapper;
import projects.vendex.util.UserView;
import projects.vendex.auth.jwt.security.JwtService;
import projects.vendex.exceptions.NotFoundException;

@Slf4j
@Service
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
    private final RefreshTokenService refreshTokenService;

    @Autowired
    private HttpServletRequest request;

    UserService(UserRepository userRepository, UserMapper userMapper,
                AuthenticationManager authenticationManager, JwtService jwtService,
                RefreshTokenService refreshTokenService){
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    public UserView addUser(UserDto dto){
        if (userRepository.existsByEmail(dto.getEmail()))
            throw new IllegalArgumentException("Email already exists");
        dto.setPassword(encoder.encode(dto.getPassword()));
        User user = this.userMapper.toUsers(dto);
        this.userRepository.save(user);

        log.info("Creating a user with username: {}", user.getEmail());
        return this.userRepository.findUserByEmail(user.getEmail());
    }

    public UserView getUser(long id){
        return this.userRepository.findUserById(id).orElseThrow(() -> new NotFoundException("User not found with id: " + id));
    }

    public void deleteUser(long id){
        this.getUser(id);

        log.info("Attempting to delete user with id: {}", id);
        this.userRepository.deleteById(id);
        log.info("User with id: {} deleted successfully", id);
    }

    public int getUserId() {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            return jwtService.extractUserId(jwt);
        }
        throw new RuntimeException("Authorization header missing or invalid");
    }

    public JwtResponseDto verify(LoginDto user){
        if (!this.userRepository.existsByEmail(user.getEmail()))
            throw new NotFoundException("User email not found. Register to make a new account");
        Authentication auth = this.authenticationManager
                .authenticate(new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword()));
        log.debug("Authenticating user info");
        if (auth.isAuthenticated()){
            RefreshToken refreshToken = this.refreshTokenService.createRefreshToken(user.getEmail());
            return JwtResponseDto.builder()
                    .accessToken(this.jwtService.generateToken(this.userRepository.findByEmail(user.getEmail())
                            .orElseThrow(() -> new UsernameNotFoundException("No user found with the provided email"))))
                    .token(refreshToken.getToken())
                    .build();
        } else {
            throw new UsernameNotFoundException("Invalid username/email provided");
        }
    }
}
