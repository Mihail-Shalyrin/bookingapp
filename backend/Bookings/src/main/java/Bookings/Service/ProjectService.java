package Bookings.Service;

import Bookings.DTO.*;
import Bookings.Model.Objects;
import Bookings.Model.Project;
import Bookings.Model.UserProject;
import Bookings.Model.Users;
import Bookings.Repository.ObjectRepository;
import Bookings.Repository.ProjectRepository;
import Bookings.Repository.UserProjectRepository;
import Bookings.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final UserProjectRepository userProjectRepository;
    private final ObjectRepository objectRepository;

    public List<ProjectDto> getMyProjects(Users user, String name) {
        List<Project> projects = (name != null && !name.isBlank())
                ? userProjectRepository.findProjectsByUserIdAndName(user.getId(), name)
                : userProjectRepository.findProjectsByUserId(user.getId());

        return projects.stream()
                .map(p -> {
                    ProjectDto dto = new ProjectDto();
                    dto.setId(p.getId());
                    dto.setName(p.getName());
                    dto.setDescription(p.getDescription());
                    return dto;
                })
                .toList();
    }
    @Transactional
    public Project createProject(CreateProjectRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new ValidationException("Требуется название проекта");
        }
        if (projectRepository.existsByName(request.getName())) {
            throw new ValidationException("Проект с таким названием уже существует");
        }

        Project project = new Project(request.getName(), request.getDescription());
        return projectRepository.save(project);
    }

    public List<Project> getAllProjects(String name) {
        if (name == null || name.isBlank()) {
            return projectRepository.findAll();
        }
        return projectRepository.findByNameContainingIgnoreCase(name);
    }
    @Transactional
    public UserProject addUserToProject(AddUserToProjectRequest request) {
        if (request.getUserId() == null || request.getProjectId() == null) {
            throw new ValidationException("требуются id пользователя и проекта");
        }

        Users user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ValidationException("пользователь или проект не найдены"));
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ValidationException("пользователь или проект не найдены"));

        boolean alreadyExists = userProjectRepository.existsByUserIdAndProjectId(
                request.getUserId(), request.getProjectId()
        );
        if (alreadyExists) {
            throw new ValidationException("Пользователь уже есть в проекте");
        }

        UserProject userProject = new UserProject();
        userProject.setUser(user);
        userProject.setProject(project);

        return userProjectRepository.save(userProject);
    }
    //поиск людей которые не в проекте
    public List<UserShortDto> findUsersNotInProject(Long projectId, String name) {
        projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Проект не найден"));

        if (name != null && !name.isBlank()) {
            return userRepository.findUsersNotInProjectByName(projectId, name);
        }
        return userRepository.findUsersNotInProject(projectId);
    }

    //ПОИСК ЮЗЕРА С ОТОБРАЖЕНИЕМ ПРИНАДЛЕЖНОСТИ К ПРОЕКТУ
    public List<UserWithMembershipDto> findUsersForProject(Long projectId, String name) {
        projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Проект не найден"));

        String nameFilter = (name != null && !name.isBlank()) ? name : null;
        return userRepository.findUsersWithMembership(projectId, nameFilter);
    }

    public List<UserShortDto> getProjectUsers(Long projectId, String name) {
        projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Проект не найден"));

        List<UserProject> relations;
        if (name != null && !name.isBlank()) {
            relations = userProjectRepository.findByProjectIdAndUsernameContaining(projectId, name);
        } else {
            relations = userProjectRepository.findByProjectId(projectId);
        }

        List<UserShortDto> users = new ArrayList<>();
        for (UserProject relation : relations) {
            Users u = relation.getUser();
            users.add(new UserShortDto(u.getId(), u.getUsername(), u.getLastname()));
        }
        return users;
    }

    @Transactional
    public void removeUserFromProject(Long projectId, Long userId) {
        boolean exists = userProjectRepository.existsByUserIdAndProjectId(userId, projectId);
        if (!exists) {
            throw new NotFoundException("Пользователь в проекте не найден");
        }
        userProjectRepository.deleteByUserIdAndProjectId(userId, projectId);
    }

    @Transactional
    public void deleteProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Проект не существует"));

        // 1. удалить связи user-project
        List<UserProject> relations = userProjectRepository.findByProjectId(projectId);
        userProjectRepository.deleteAll(relations);

        // 2. снять резерв у объектов
        List<Objects> objects = (List<Objects>) objectRepository.findAll();
        for (Objects object : objects) {
            if (object.getReservedForProject() != null &&
                    object.getReservedForProject().getId().equals(projectId)) {
                object.setReservedForProject(null);
                object.setReservedForUser(null);
                objectRepository.save(object);
            }
        }

        // 3. удалить проект
        projectRepository.delete(project);
    }
}