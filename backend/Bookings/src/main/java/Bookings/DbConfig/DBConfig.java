package Bookings.DbConfig;

import Bookings.Model.*;

import Bookings.Repository.*;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

@Configuration

public class DBConfig {
    @Bean
    @Order(3)
    public ApplicationRunner dataLoader(
            ObjectRepository roomRep,
            OfficeRepository officeRepository,
            FloorRepository floorRepository,
            RoomRepository roomRepository
    ) {
        return args -> {
            Office off = officeRepository.save(
                    new Office("Moscow", "Department1")
            );

            Floor floor = new Floor();
            floor.setNum((byte) 1);
            floor.setOffice(off);
            floor = floorRepository.save(floor);
            Room room = new Room();
            room.setNumber("1A");
            room.setFloor(floor);
            roomRepository.save(room);
            Objects obj1 = new Objects("table", Objects.Type.ROOM, "1A");
            obj1.setRoom(room);
            roomRep.save(obj1);

            Objects obj2 = new Objects("meeting", Objects.Type.MEETING, "2A");
            obj2.setRoom(room);
            roomRep.save(obj2);

            Objects obj3 = new Objects("HALL", Objects.Type.HALL, "2A");
            obj3.setRoom(room);
            roomRep.save(obj3);
        };
    }
}
