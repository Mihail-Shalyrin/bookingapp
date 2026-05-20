
package Bookings.Repository;

import Bookings.Model.Bookings;
import Bookings.Model.Objects;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends CrudRepository<Bookings, Long> {

   List<Bookings> findByUser_Id(Long userId);
   List<Bookings> findAll();
   void deleteByEndTimeBefore(LocalDateTime dateTime);
   @Query("""
    select b
    from Bookings b
    join fetch b.user
    where b.object.id in :objectIds
      and b.startTime < :end
      and b.endTime > :start
""")
   List<Bookings> findBookingsForObjects(
           @Param("objectIds") List<Long> objectIds,
           @Param("start") LocalDateTime start,
           @Param("end") LocalDateTime end
   );
   @Query("""
        select count(b) > 0
        from Bookings b
        where b.object.id = :objectId
          and b.startTime < :newEnd
          and b.endTime > :newStart
    """)
   boolean existsOverlappingBooking(@Param("objectId") Long objectId,
                                    @Param("newStart") LocalDateTime newStart,
                                    @Param("newEnd") LocalDateTime newEnd);

//   @Query("""
//        select count(b) > 0
//        from Bookings b
//        where b.user.id = :userId
//          and b.object.type = :type
//          and b.startTime < :newEnd
//          and b.endTime > :newStart
//    """)
//   boolean existsUserBookingByTypeAndPeriod(@Param("userId") Long userId,
//                                            @Param("type") Objects.Type type,
//                                            @Param("newStart") LocalDateTime newStart,
//                                            @Param("newEnd") LocalDateTime newEnd);
   @Query("""
    select count(b) > 0
    from Bookings b
    where b.user.id = :userId
      and b.startTime >= :dayStart
      and b.startTime < :dayEnd
""")
   boolean existsBookingForDay(@Param("userId") Long userId,
                               @Param("dayStart") LocalDateTime dayStart,
                               @Param("dayEnd") LocalDateTime dayEnd);
   @Query("""
    select count(b) > 0
    from Bookings b
    where b.user.id = :userId
      and b.object.type = :type
      and b.startTime >= :dayStart
      and b.startTime < :dayEnd
""")
   boolean existsUserBookingByTypeForDay(@Param("userId") Long userId,
                                         @Param("type") Objects.Type type,
                                         @Param("dayStart") LocalDateTime dayStart,
                                         @Param("dayEnd") LocalDateTime dayEnd);


   @Query("""
        select b
        from Bookings b
        where lower(b.user.username) like lower(concat('%', :username, '%'))
        order by b.startTime
    """)
   List<Bookings> findByUsernameContaining(@Param("username") String username);
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
    select b
    from Bookings b
    join fetch b.object obj
    join fetch obj.room r
    join fetch r.floor f
    join fetch f.office o
    where b.user.id = :userId
    order by o.city, f.num, r.number, obj.spot, b.startTime
""")
   List<Bookings> findMyBookingsWithStructure(@Param("userId") Long userId);

   @Query("""
    select b
    from Bookings b
    join fetch b.user u
    where b.object.id in :objectIds
      and b.startTime < :end
      and b.endTime > :start
      and (:username is null or lower(u.username) like lower(concat('%', :username, '%')))
""")
   List<Bookings> findBookingsForObjectsByUsername(
           @Param("objectIds") List<Long> objectIds,
           @Param("start") LocalDateTime start,
           @Param("end") LocalDateTime end,
           @Param("username") String username
   );

   //ДЛЯ ПОИСКА ЗАБРОНИРОВАННЫХ ОБЪЕКТОВ ПОЛЬЗОВАТЕЛЯ
   @Query("""
    select b
    from Bookings b
    join fetch b.user u
    where b.object.id in :objectIds
      and b.user.id = :userId
      and b.startTime < :end
      and b.endTime > :start
""")
   List<Bookings> findBookingsForObjectsByUserId(
           @Param("objectIds") List<Long> objectIds,
           @Param("userId") Long userId,
           @Param("start") LocalDateTime start,
           @Param("end") LocalDateTime end
   );
   @Query("""
    select b
    from Bookings b
    join fetch b.user u
    where b.object.id in :objectIds
      and b.user.id = :userId
""")
   List<Bookings> findAllBookingsForObjectsByUserId(
           @Param("objectIds") List<Long> objectIds,
           @Param("userId") Long userId
   );
}