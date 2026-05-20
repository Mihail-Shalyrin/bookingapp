package Bookings.Repository;

import Bookings.Model.Project;
import Bookings.Model.UserProject;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserProjectRepository extends CrudRepository<UserProject, Long> {

//    boolean existsByUserIdAndProjectId(Long userId, Long projectId);
    boolean existsByUserIdAndProjectId(Long userId, Long projectId);

    List<UserProject> findByProjectId(Long projectId);

    List<UserProject> findByUserId(Long userId);
    @Transactional
    void deleteByUserIdAndProjectId(Long userId, Long projectId);
    @Query("""
    select up.project from UserProject up
    where up.user.id = :userId
    order by up.project.name
""")
    List<Project> findProjectsByUserId(@Param("userId") Long userId);

    @Query("""
    select up.project from UserProject up
    where up.user.id = :userId
      and lower(up.project.name) like lower(concat('%', :name, '%'))
    order by up.project.name
""")
    List<Project> findProjectsByUserIdAndName(
            @Param("userId") Long userId,
            @Param("name") String name
    );


    @Query("""
    select up from UserProject up
    where up.project.id = :projectId
      and lower(up.user.username) like lower(concat('%', :name, '%'))
""")
    List<UserProject> findByProjectIdAndUsernameContaining(
            @Param("projectId") Long projectId,
            @Param("name") String name
    );

}