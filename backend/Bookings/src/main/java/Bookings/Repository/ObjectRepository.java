package Bookings.Repository;

import Bookings.Model.Objects;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ObjectRepository extends CrudRepository<Objects,Long> {
    //РЕЗЕРВЫ
    @Query("""
    select obj
    from Objects obj
    join fetch obj.room r
    join fetch r.floor f
    join fetch f.office o
    where obj.reservedForUser.id = :userId
      and (:office is null or o.city = :office)
      and (:floor is null or f.num = :floor)
      and (:type is null or obj.type = :type)
    order by o.city, f.num, r.number, obj.spot
""")
    List<Objects> findReservedForUser(
            @Param("userId") Long userId,
            @Param("office") String office,
            @Param("floor") Byte floor,
            @Param("type") Objects.Type type
    );
 //ДЛЯ ПРОЕКТОВ!!!

    @Query("""
    select obj
    from Objects obj
    join fetch obj.room r
    join fetch r.floor f
    join fetch f.office o
    where obj.reservedForProject.id = :projectId
      and obj.type in :type
    order by o.city, f.num, r.number, obj.spot
""")
    List<Objects> findObjectsByProject(
            @Param("projectId") Long projectId,
            @Param("type") List<Objects.Type> type
    );

    @Query("""
    select obj
    from Objects obj
    join fetch obj.room r
    join fetch r.floor f
    join fetch f.office o
    where obj.reservedForProject.id = :projectId
      and obj.type in :types
      and (:office is null or o.city = :office)
      and (:floor is null or f.num = :floor)
    order by o.city, f.num, r.number, obj.spot
""")
    List<Objects> findProjectRoomsFiltered(
            @Param("projectId") Long projectId,
            @Param("types") List<Objects.Type> types,
            @Param("office") String office,
            @Param("floor") Byte floor
    );
    @Query("""
        select o from Objects o
        where o.type in :types
          and o.id not in (
              select b.object.id
              from Bookings b
              where b.startTime < :endTime
                and b.endTime > :startTime
          )
    """)
    List<Objects> findFreeRoomsByTypesAndPeriod(@Param("types") List<Objects.Type> types,
                                                @Param("startTime") LocalDateTime startTime,
                                                @Param("endTime") LocalDateTime endTime);
    List<Objects> findAll();
//    List<Objects> findByTypeIn(List<Objects.Type> types);
    List<Objects> findByTypeInAndReservedForUserIsNull(List<Objects.Type> types);





    @Query("""
    select obj
    from Objects obj
    join fetch obj.room r
    join fetch r.floor f
    join fetch f.office o
    where obj.type in :type
      and (
           (obj.reservedForUser is null and obj.reservedForProject is null)
           or obj.reservedForUser.id = :userId
           or obj.reservedForProject.id in (
                select up.project.id from UserProject up where up.user.id = :userId
           )
      )
    order by o.city, f.num, r.number, obj.spot
""")
    List<Objects> findVisibleObjectsForUser(
            @Param("userId") Long userId,
            @Param("type") List<Objects.Type> type
    );
    @Query("""
    select distinct obj
    from Objects obj
    join fetch obj.room r
    join fetch r.floor f
    join fetch f.office o

    where obj.type in :types

      and (
                                                             :office is null
                                                             or lower(cast(o.city as string))
                                                                = lower(cast(:office as string))
                                                         )

      and (:floor is null
           or f.num = :floor)

      and obj.id not in (
            select b.object.id
            from Bookings b
            where b.startTime < :endTime
              and b.endTime > :startTime
      )

      and (
            (obj.reservedForUser is null
             and obj.reservedForProject is null)

            or obj.reservedForUser.id = :userId

            or obj.reservedForProject.id in (
                select up.project.id
                from UserProject up
                where up.user.id = :userId
            )
      )

    order by o.city, f.num, r.number, obj.spot
""")
    List<Objects> findAvailableRooms(
            @Param("userId") Long userId,
            @Param("types") List<Objects.Type> types,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("office") String office,
            @Param("floor") Byte floor
    );
    @Query("""
    select count(distinct b.object.id)
    from Bookings b
    where b.object.room.id = :roomId
      and b.startTime < :endTime
      and b.endTime > :startTime
""")
    int countBookedPlaces(
            @Param("roomId") Long roomId,
            @Param("startTime")
            LocalDateTime startTime,
            @Param("endTime")
            LocalDateTime endTime
    );
    @Query("""
    select count(o)
    from Objects o
    where o.room.id = :roomId
""")
    int countTotalPlaces(
            @Param("roomId")
            Long roomId
    );

    //просле того как юзер нажал на объект должно выводить
    @Query("""
    select obj
    from Objects obj
    join fetch obj.room r
    join fetch r.floor f
    join fetch f.office o
    where obj.id = :objectId
      and obj.type in :type
      and (
           (obj.reservedForUser is null and obj.reservedForProject is null)
           or obj.reservedForUser.id = :userId
           or obj.reservedForProject.id in (
                select up.project.id from UserProject up where up.user.id = :userId
           )
      )
""")
    Optional<Objects> findVisibleObjectById(
            @Param("objectId") Long objectId,
            @Param("userId") Long userId,
            @Param("type") List<Objects.Type> type
    );
    //для просмотра только забронированных объектов
    @Query("""
    select obj
    from Objects obj
    join fetch obj.room r
    join fetch r.floor f
    join fetch f.office o
    where (:office is null or o.city = :office)
      and (:floor is null or f.num = :floor)
      and (:type is null or obj.type = :type)
    order by o.city, f.num, r.number, obj.spot
""")
    List<Objects> findAllWithFilters(
            @Param("office") String office,
            @Param("floor") Byte floor,
            @Param("type") Objects.Type type
    );
    @Query("""
    select obj
    from Objects obj
    join fetch obj.room r
    join fetch r.floor f
    join fetch f.office o
    where obj.reservedForUser is not null
      and (:userId is null or obj.reservedForUser.id = :userId)
      and (:office is null or o.city = :office)
      and (:floor is null or f.num = :floor)
      and (:type is null or obj.type = :type)
    order by o.city, f.num, r.number, obj.spot
""")
    List<Objects> findAllReservedForUsers(
            @Param("userId") Long userId,
            @Param("office") String office,
            @Param("floor") Byte floor,
            @Param("type") Objects.Type type
    );

    @Query("""
    select obj
    from Objects obj
    join fetch obj.room r
    join fetch r.floor f
    join fetch f.office o
    where obj.reservedForProject is not null
      and (:projectId is null or obj.reservedForProject.id = :projectId)
      and (:office is null or o.city = :office)
      and (:floor is null or f.num = :floor)
      and (:type is null or obj.type = :type)
    order by o.city, f.num, r.number, obj.spot
""")
    List<Objects> findAllReservedForProjects(
            @Param("projectId") Long projectId,
            @Param("office") String office,
            @Param("floor") Byte floor,
            @Param("type") Objects.Type type
    );

    //ПОИСК СВОБОДНЫХ ОБЪЕКТОВ ДЛЯ РЕЗЕРВИРОВАНИЯ В ПРОЕКТ
    @Query("""
    select obj
    from Objects obj
    join fetch obj.room r
    join fetch r.floor f
    join fetch f.office o
    where obj.reservedForUser is null
      and obj.reservedForProject is null
      and (:type is null or obj.type = :type)
      and (:office is null or o.city = :office)
      and (:floor is null or f.num = :floor)
    order by o.city, f.num, r.number, obj.spot
""")
    List<Objects> findFreeForReservation(
            @Param("type") Objects.Type type,
            @Param("office") String office,
            @Param("floor") Byte floor
    );

    //ПОИСК СВОБОДНЫХ ОБЪЕКТОВ ДЛЯ БРОНИРОВАНИЯ ЗА ЮЗЕРОМ

    @Query("""
    select obj
    from Objects obj
    join fetch obj.room r
    join fetch r.floor f
    join fetch f.office o
    where obj.type in :types
      and (:office is null or o.city = :office)
      and (:floor is null or f.num = :floor)
    order by o.city, f.num, r.number, obj.spot
""")
    List<Objects> findAvailableRoomsAdmin(
            @Param("types") List<Objects.Type> types,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("office") String office,
            @Param("floor") Byte floor
    );

}

