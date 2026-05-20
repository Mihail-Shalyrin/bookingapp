package Bookings.Repository;

import Bookings.DTO.UserShortDto;
import Bookings.Model.Users;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import Bookings.DTO.UserWithMembershipDto;
@Repository
public interface UserRepository extends CrudRepository<Users,Long> {
    @Query("""
    select new Bookings.DTO.UserShortDto(u.id, u.username, u.lastname)
    from Users u
    where u.id not in (
        select up.user.id from UserProject up
        where up.project.id = :projectId
    )
    order by u.username
""")
    List<UserShortDto> findUsersNotInProject(@Param("projectId") Long projectId);

    @Query("""
    select new Bookings.DTO.UserShortDto(u.id, u.username, u.lastname)
    from Users u
    where u.id not in (
        select up.user.id from UserProject up
        where up.project.id = :projectId
    )
      and lower(u.username) like lower(concat('%', :name, '%'))
    order by u.username
""")
    List<UserShortDto> findUsersNotInProjectByName(
            @Param("projectId") Long projectId,
            @Param("name") String name
    );
    Users findByUsername(String name);
    List<Users> findAll();


    boolean existsByUsername(String username);

//    @Query("""
//    select u from Users u
//    where (:name is null or lower(u.username) like lower(concat('%', :name, '%')))
//    order by u.username
//""")
//    List<Users> searchUsers(@Param("name") String name);

    //Посик ЮЗЕРОВ В ПРОЕКТЕ
    @Query("""
    select new Bookings.DTO.UserWithMembershipDto(
        u.id, u.username, u.lastname,
        case when exists (
            select 1 from UserProject up
            where up.user.id = u.id and up.project.id = :projectId
        ) then true else false end
    )
    from Users u
    where (:name is null or lower(u.username) like lower(concat('%', :name, '%')))
    order by u.username
""")
    List<UserWithMembershipDto> findUsersWithMembership(
            @Param("projectId") Long projectId,
            @Param("name") String name
    );
    //ПОИСК ЧЕЛОВЕКА ПО ИМЕНИ ДЛЯ ОБЫЧНЫХ РЕЗЕРВИРОВАНИЕ
//    @Query("""
//    select u from Users u
//    where (:name is null or lower(u.username) like lower(concat('%', :name, '%')))
//    order by u.username
//""")
//    List<Users> searchUsers(@Param("name") String name);
    @Query("""
    select u from Users u
    order by u.username
""")
    List<Users> findAllOrderedByUsername();

    @Query("""
    select u from Users u
    where lower(u.username) like lower(concat('%', :name, '%'))
    order by u.username
""")
    List<Users> searchUsersByName(@Param("name") String name);

}
