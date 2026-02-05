const hostelService = require('../services/hostelService');

const getHostels = async (req, res, next) => {
  try {
    const gender = req.query.gender || null;
    const yearGroup = req.query.year || req.query.year_group || null;
    const hostels = await hostelService.getHostels({ gender, yearGroup });
    res.json(hostels.map(h => h.name));
  } catch (err) {
    next(err);
  }
};

const getHostelStats = async (req, res, next) => {
  try {
    const hostelName = req.query.hostel || null;
    const stats = await hostelService.getHostelStats(hostelName);
    res.json(stats);
  } catch (err) {
    next(err);
  }
};

const getAllAllocations = async (req, res, next) => {
  try {
    const allocations = await hostelService.getAllAllocations();
    res.json(allocations);
  } catch (err) {
    next(err);
  }
};

const getStudentHostelDetails = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const allocation = await hostelService.getStudentHostelDetails(userId);
    res.json(allocation);
  } catch (err) {
    next(err);
  }
};

const assignRoom = async (req, res, next) => {
  try {
    const { userId, roomId, startDate, endDate } = req.body;
    const allocation = await hostelService.assignRoom(
      parseInt(userId, 10), 
      parseInt(roomId, 10),
      startDate,
      endDate
    );
    res.status(201).json(allocation);
  } catch (err) {
    next(err);
  }
};

const removeAllocation = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const result = await hostelService.removeAllocation(userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const createRoom = async (req, res, next) => {
  try {
    const { hostel, number, floor, capacity, type } = req.body;
    const room = await hostelService.createRoom({ hostel, number, floor, capacity, type });
    res.status(201).json(room);
  } catch (err) {
    next(err);
  }
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
