package Bookings.Repository;

import Bookings.Model.Project;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectRepository extends CrudRepository<Project, Long> {
    List<Project> findAll();
    boolean existsByName(String name);
    @Query("""
    select up.project
    from UserProject up
    where up.user.id = :userId
      and (:name is null or lower(up.project.name) like lower(concat('%', :name, '%')))
    order by up.project.name
""")
    List<Project> findProjectsByUserId(
            @Param("userId") Long userId,
            @Param("name") String name
    );

    List<Project> findByNameContainingIgnoreCase(String name);


}