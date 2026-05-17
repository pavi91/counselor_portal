const hostelRepository = require('../repositories/hostelRepository');

const getHostels = async (filters = {}) => hostelRepository.getHostels(filters);

const getHostelStats = async (hostelName = null) => {
  const hostels = await hostelRepository.getHostels();
  let hostelId = null;

  if (hostelName && hostelName !== 'All') {
    const hostel = hostels.find(h => h.name === hostelName);
    hostelId = hostel ? hostel.id : null;
  }

  const rooms = await hostelRepository.getRooms(hostelId);
  const allocations = await hostelRepository.getAllocations();

  const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);

  const roomStats = rooms.map(room => {
    const roomAllocations = allocations.filter(a => a.roomId === room.id);
    const occupants = roomAllocations.map(alloc => ({
      id: alloc.id,
      userId: alloc.userId,
      studentName: alloc.studentName,
      studentEmail: alloc.studentEmail,
      startDate: alloc.startDate,
      endDate: alloc.endDate
    }));

    return {
      ...room,
      occupants,
      currentOccupancy: occupants.length,
      isFull: occupants.length >= room.capacity,
      availableSlots: room.capacity - occupants.length
    };
  });

  const occupiedBeds = roomStats.reduce((sum, room) => sum + room.currentOccupancy, 0);

  return {
    totalCapacity,
    occupiedBeds,
    availableBeds: totalCapacity - occupiedBeds,
    roomStats
  };
};

const getAllAllocations = async () => hostelRepository.getAllocations();

const getStudentHostelDetails = async (userId) => hostelRepository.getAllocationByUserId(userId);

const assignRoom = async (userId, roomId, startDate = null, endDate = null) => {
  const existing = await hostelRepository.getAllocationByUserId(userId);
  if (existing) {
    const err = new Error('Student is already assigned to a room.');
    err.status = 400;
    throw err;
  }

  const room = await hostelRepository.getRoomById(roomId);
  if (!room) {
    const err = new Error('Room not found');
    err.status = 404;
    throw err;
  }

  const currentOccupants = await hostelRepository.getAllocationsByRoomId(roomId);
  if (currentOccupants.length >= room.capacity) {
    const err = new Error('This room is already at full capacity.');
    err.status = 400;
    throw err;
  }

  // Use provided dates or fallback to default values
  const finalStartDate = startDate || new Date().toISOString().split('T')[0];
  const finalEndDate = endDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    .toISOString()
    .split('T')[0];

  const id = await hostelRepository.createAllocation({ userId, roomId, startDate: finalStartDate, endDate: finalEndDate });
  return { id, userId, roomId, startDate: finalStartDate, endDate: finalEndDate };
};

const removeAllocation = async (userId) => {
  await hostelRepository.removeAllocationByUserId(userId);
  return { success: true };
};

const createRoom = async (roomData) => {
  let hostel = null;

  if (roomData.hostelId !== undefined && roomData.hostelId !== null && roomData.hostelId !== '') {
    hostel = await hostelRepository.getHostelById(parseInt(roomData.hostelId, 10));
  }

  if (!hostel && roomData.hostel) {
    const hostels = await hostelRepository.getHostels();
    hostel = hostels.find(h => h.name === roomData.hostel);
  }
  
  if (!hostel) {
    const err = new Error('Hostel not found');
    err.status = 404;
    throw err;
  }
  
  const existing = await hostelRepository.findRoomByHostelAndNumber(hostel.id, roomData.number);
  if (existing) {
    const err = new Error(`Room ${roomData.number} already exists in ${roomData.hostel}.`);
    err.status = 400;
    throw err;
  }
  
  const id = await hostelRepository.createRoom({
    hostelId: hostel.id,
    number: roomData.number,
    floor: roomData.floor,
    capacity: roomData.capacity,
    type: roomData.type
  });
  
  return { id, hostel: hostel.name, hostelId: hostel.id, number: roomData.number, floor: roomData.floor, capacity: roomData.capacity, type: roomData.type };
};

const deleteRoom = async (roomId) => {
  const room = await hostelRepository.getRoomById(roomId);
  if (!room) {
    const err = new Error('Room not found');
    err.status = 404;
    throw err;
  }

  const allocations = await hostelRepository.getAllocationsByRoomId(roomId);
  if (allocations.length > 0) {
    const err = new Error('Cannot delete room: room is not empty');
    err.status = 400;
    throw err;
  }

  const deleted = await hostelRepository.deleteRoomById(roomId);
  if (!deleted) {
    const err = new Error('Failed to delete room');
    err.status = 500;
    throw err;
  }

  return { success: true };
};

module.exports = {
  getHostels,
  getHostelStats,
  getAllAllocations,
  getStudentHostelDetails,
  assignRoom,
  removeAllocation,
  createRoom
  ,deleteRoom
};
