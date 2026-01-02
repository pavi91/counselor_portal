// src/api/hostelApi.js
import { MOCK_HOSTEL_ROOMS, MOCK_ALLOCATIONS, MOCK_USERS } from '../utils/mockDB';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Get Overview
export const getHostelStatsAPI = async () => {
  await delay(300);
  
  const totalCapacity = MOCK_HOSTEL_ROOMS.reduce((sum, room) => sum + room.capacity, 0);
  const occupiedBeds = MOCK_ALLOCATIONS.length;
  
  // Calculate detailed room stats
  const roomStats = MOCK_HOSTEL_ROOMS.map(room => {
    // Find allocations for this room
    const allocations = MOCK_ALLOCATIONS.filter(a => a.roomId === room.id);
    
    // Enrich allocation with student names
    const occupants = allocations.map(alloc => {
      const student = MOCK_USERS.find(u => u.id === alloc.userId);
      return {
        ...alloc,
        studentName: student ? student.name : 'Unknown',
        studentEmail: student ? student.email : 'Unknown'
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

  return {
    totalCapacity,
    occupiedBeds,
    availableBeds: totalCapacity - occupiedBeds,
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

// --- MANAGEMENT APIs ---

export const assignRoomAPI = async (userId, roomId) => {
  await delay(400);

  // Validation 1: Is user already assigned?
  if (MOCK_ALLOCATIONS.find(a => a.userId === parseInt(userId))) {
    throw new Error("Student is already assigned to a room.");
  }

  // Validation 2: Is room full?
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

// --- NEW STRUCTURAL APIs ---

export const createRoomAPI = async (roomData) => {
  await delay(400);

  // Check if room number exists
  if (MOCK_HOSTEL_ROOMS.some(r => r.number === roomData.number)) {
    throw new Error(`Room number ${roomData.number} already exists.`);
  }

  const newRoom = {
    id: Date.now(),
    number: roomData.number,
    floor: parseInt(roomData.floor),
    capacity: parseInt(roomData.capacity),
    type: roomData.type
  };

  MOCK_HOSTEL_ROOMS.push(newRoom);
  return newRoom;
};