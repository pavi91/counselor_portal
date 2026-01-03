// src/api/hostelApi.js
import { MOCK_HOSTEL_ROOMS, MOCK_ALLOCATIONS, MOCK_USERS } from '../utils/mockDB';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- GETTERS ---

export const getHostelsAPI = async () => {
  await delay(200);
  const hostels = [...new Set(MOCK_HOSTEL_ROOMS.map(r => r.hostel))];
  return hostels.sort();
};

export const getHostelStatsAPI = async (hostelName = null) => {
  await delay(300);
  
  // 1. Filter rooms if a specific hostel is selected
  let rooms = MOCK_HOSTEL_ROOMS;
  if (hostelName && hostelName !== 'All') {
    rooms = rooms.filter(r => r.hostel === hostelName);
  }

  const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
  
  // 2. Map rooms to include their occupant details
  const roomStats = rooms.map(room => {
    // Find allocations for this specific room
    const allocations = MOCK_ALLOCATIONS.filter(a => a.roomId === room.id);
    
    // Enrich with user details
    const occupants = allocations.map(alloc => {
      const student = MOCK_USERS.find(u => u.id === alloc.userId);
      return {
        ...alloc,
        studentName: student ? student.name : 'Unknown',
        studentEmail: student ? student.email : 'Unknown',
        role: student ? student.role : 'student'
      };
    });

    return {
      ...room,
      occupants,
      currentOccupancy: occupants.length,
      isFull: occupants.length >= room.capacity,
      availableSlots: room.capacity - occupants.length
    };
  });

  // 3. Calculate Global Occupancy for the selected scope
  const occupiedBeds = roomStats.reduce((sum, room) => sum + room.currentOccupancy, 0);

  return {
    totalCapacity,
    occupiedBeds,
    availableBeds: totalCapacity - occupiedBeds,
    roomStats
  };
};

// Used to check if a specific student is already allocated anywhere
export const getAllAllocationsAPI = async () => {
    await delay(200);
    return [...MOCK_ALLOCATIONS];
};

export const getStudentHostelDetailsAPI = async (userId) => {
  await delay(300);
  const allocation = MOCK_ALLOCATIONS.find(a => a.userId === userId);
  if (!allocation) return null;
  const room = MOCK_HOSTEL_ROOMS.find(r => r.id === allocation.roomId);
  return {
    hostelName: room.hostel,
    roomNumber: room.number,
    floor: room.floor,
    startDate: allocation.startDate,
    endDate: allocation.endDate
  };
};

// --- ACTION METHODS ---

export const assignRoomAPI = async (userId, roomId) => {
  await delay(400);

  // Business Rule 1: Student cannot be in two rooms
  if (MOCK_ALLOCATIONS.find(a => a.userId === parseInt(userId))) {
    throw new Error("Student is already assigned to a room.");
  }

  // Business Rule 2: Room cannot exceed capacity
  const currentOccupants = MOCK_ALLOCATIONS.filter(a => a.roomId === parseInt(roomId));
  const room = MOCK_HOSTEL_ROOMS.find(r => r.id === parseInt(roomId));
  
  if (currentOccupants.length >= room.capacity) {
    throw new Error("This room is already at full capacity.");
  }

  const newAllocation = {
    id: Date.now(),
    userId: parseInt(userId),
    roomId: parseInt(roomId),
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  };

  MOCK_ALLOCATIONS.push(newAllocation);
  return newAllocation;
};

export const removeAllocationAPI = async (userId) => {
  await delay(300);
  const index = MOCK_ALLOCATIONS.findIndex(a => a.userId === parseInt(userId));
  if (index === -1) throw new Error("Allocation not found");
  
  MOCK_ALLOCATIONS.splice(index, 1);
  return { success: true };
};

export const createRoomAPI = async (roomData) => {
  await delay(400);

  if (MOCK_HOSTEL_ROOMS.some(r => r.number === roomData.number && r.hostel === roomData.hostel)) {
    throw new Error(`Room ${roomData.number} already exists in ${roomData.hostel}.`);
  }

  const newRoom = {
    id: Date.now(),
    hostel: roomData.hostel,
    number: roomData.number,
    floor: parseInt(roomData.floor),
    capacity: parseInt(roomData.capacity),
    type: roomData.type
  };

  MOCK_HOSTEL_ROOMS.push(newRoom);
  return newRoom;
};