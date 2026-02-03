const hostelRepository = require('../repositories/hostelRepository');

const getHostels = async () => hostelRepository.getHostels();

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

const assignRoom = async (userId, roomId) => {
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

  const startDate = new Date().toISOString().split('T')[0];
  const endDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    .toISOString()
    .split('T')[0];

  const id = await hostelRepository.createAllocation({ userId, roomId, startDate, endDate });
  return { id, userId, roomId, startDate, endDate };
};

const removeAllocation = async (userId) => {
  await hostelRepository.removeAllocationByUserId(userId);
  return { success: true };
};

const createRoom = async (roomData) => {
  const hostels = await hostelRepository.getHostels();
  const hostel = hostels.find(h => h.name === roomData.hostel);
  
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
  
  return { id, hostel: roomData.hostel, number: roomData.number, floor: roomData.floor, capacity: roomData.capacity, type: roomData.type };
};

module.exports = {
  getHostels,
  getHostelStats,
  getAllAllocations,
  getStudentHostelDetails,
  assignRoom,
  removeAllocation,
  createRoom
};
