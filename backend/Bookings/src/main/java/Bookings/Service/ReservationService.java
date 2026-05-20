package Bookings.Service;

import Bookings.DTO.OfficeDto;
import Bookings.DTO.ReserveProjectSpot;
import Bookings.DTO.ReserveSpot;
import Bookings.Model.Objects;
import Bookings.Model.Project;
import Bookings.Model.Users;
import Bookings.Repository.ObjectRepository;
import Bookings.Repository.ProjectRepository;
import Bookings.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ObjectRepository objectRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final StructureService structureService;

    //ПОЛУЧИТЬ ОБЪЕКТЫ СВОБОДНЫЕ ДЛЯ РЕЗЕРВА
    public List<OfficeDto> getFreeForUserReservation(
            Long userId,
            String office,
            Byte floor,
            Objects.Type type
    ) {
        userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));

        List<Objects> objects = objectRepository.findFreeForReservation(
                type, office, floor
        );
        return structureService.buildAdminStructure(objects);
    }
    //просмотр зарезервированных мест под юзера
    public List<OfficeDto> getReservedForUser(
            Long userId,
            String office,
            Byte floor,
            Objects.Type type
    ) {
        userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));

        return getReservedForUsers(userId, office, floor, type);
    }

    @Transactional
    public Objects reserveForUser(ReserveSpot spot) {
        if (spot.getObjectId() == null || spot.getUserId() == null) {
            throw new ValidationException("требуются id пользователя и объекта");
        }

        Objects object = objectRepository.findById(spot.getObjectId())
                .orElseThrow(() -> new ValidationException("Объект или пользователь не найдены"));
        Users user = userRepository.findById(spot.getUserId())
                .orElseThrow(() -> new ValidationException("Объект или пользователь не найдены"));

        if (object.getReservedForUser() != null) {
            throw new ValidationException("Место зарезервировано за другим пользователем!");
        }
        if (object.getReservedForProject() != null) {
            throw new ValidationException("Место уже зарезервировано за проектом!");
        }

        object.setReservedForUser(user);
        return objectRepository.save(object);
    }

    @Transactional
    public Objects reserveForProject(ReserveProjectSpot spot) {
        if (spot.getObjectId() == null || spot.getProjectId() == null) {
            throw new ValidationException("требуются id объекта и проекта");
        }

        Objects object = objectRepository.findById(spot.getObjectId())
                .orElseThrow(() -> new ValidationException("объект или проект не найдены"));
        Project project = projectRepository.findById(spot.getProjectId())
                .orElseThrow(() -> new ValidationException("объект или проект не найдены"));

        if (object.getReservedForUser() != null) {
            throw new ValidationException("это место уже зарезервировано за пользователем");
        }
        if (object.getReservedForProject() != null) {
            throw new ValidationException("это место уже зарезервировано за проектом");
        }

        object.setReservedForProject(project);
        return objectRepository.save(object);
    }

    @Transactional
    public Objects unreserve(Long objectId) {
        Objects object = objectRepository.findById(objectId)
                .orElseThrow(() -> new NotFoundException("объект не найден"));

        object.setReservedForUser(null);
        object.setReservedForProject(null);
        return objectRepository.save(object);
    }


    public List<OfficeDto> getReservedForUsers(
            Long userId,
            String office,
            Byte floor,
            Objects.Type type
    ) {
        List<Objects> objects = objectRepository.findAllReservedForUsers(
                userId, office, floor, type
        );
        return structureService.buildAdminStructure(objects);
    }

    public List<OfficeDto> getReservedForProjects(
            Long projectId,
            String office,
            Byte floor,
            Objects.Type type
    ) {
        List<Objects> objects = objectRepository.findAllReservedForProjects(
                projectId, office, floor, type
        );
        return structureService.buildAdminStructure(objects);
    }
    public List<OfficeDto> getFreeForReservation(
            Long projectId,
            String office,
            Byte floor,
            Objects.Type type
    ) {
        projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Проект не найден"));

        List<Objects> objects = objectRepository.findFreeForReservation(
                type, office, floor
        );

        return structureService.buildAdminStructure(objects);
    }
}