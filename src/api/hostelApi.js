// src/api/hostelApi.js
import { MOCK_HOSTEL_ROOMS, MOCK_ALLOCATIONS } from '../utils/mockDB';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getHostelStatsAPI = async () => {
  await delay(300);
  
  const totalCapacity = MOCK_HOSTEL_ROOMS.reduce((sum, room) => sum + room.capacity, 0);
  const occupiedBeds = MOCK_ALLOCATIONS.length;
  const availableBeds = totalCapacity - occupiedBeds;
  
  // Calculate occupancy per room
  const roomStats = MOCK_HOSTEL_ROOMS.map(room => {
    const occupants = MOCK_ALLOCATIONS.filter(a => a.roomId === room.id).length;
    return {
      ...room,
      occupants,
      isFull: occupants >= room.capacity
    };
  });

  return {
    totalCapacity,
    occupiedBeds,
    availableBeds,
    roomStats
  };
};

export const getStudentHostelDetailsAPI = async (userId) => {
  await delay(300);
  const allocation = MOCK_ALLOCATIONS.find(a => a.userId === userId);
  
  if (!allocation) return null;

  const room = MOCK_HOSTEL_ROOMS.find(r => r.id === allocation.roomId);
  
  return {
    roomNumber: room.number,
    floor: room.floor,
    startDate: allocation.startDate,
    endDate: allocation.endDate
  };
};