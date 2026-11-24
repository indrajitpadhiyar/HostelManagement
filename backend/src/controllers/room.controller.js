import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { Room } from '../models/Room.js';
import { Student } from '../models/Student.js';
import { Activity } from '../models/Activity.js';

/**
 * @desc    Get all hostel rooms with occupant details
 * @route   GET /api/v1/rooms
 * @access  Private (Warden, Guard)
 */
export const getRooms = asyncHandler(async (req, res) => {
  const { block, floor, availableOnly } = req.query;

  const query = {};
  if (block) query.block = block;
  if (floor) query.floor = floor;
  if (availableOnly === 'true') {
    query.available = { $gt: 0 };
  }

  const rooms = await Room.find(query)
    .sort({ roomNo: 1 })
    .populate({
      path: 'studentIds',
      select: 'name enrollmentNo phone department year hostelStatus avatar',
    });

  // Calculate summary
  const totalRooms = rooms.length;
  const totalCapacity = rooms.reduce((acc, r) => acc + (r.capacity || 0), 0);
  const totalOccupied = rooms.reduce((acc, r) => acc + (r.occupied || 0), 0);
  const totalAvailable = rooms.reduce((acc, r) => acc + (r.available || 0), 0);

  return res.status(200).json(
    ApiResponse.success(
      {
        summary: {
          totalRooms,
          totalCapacity,
          totalOccupied,
          totalAvailable,
          occupancyRate: totalCapacity ? Math.round((totalOccupied / totalCapacity) * 100) : 0,
        },
        rooms,
      },
      'Rooms retrieved successfully'
    )
  );
});


//  @desc    Create a new hostel room
//  @route   POST /api/v1/rooms
//  @access  Private (Warden only)
 
export const createRoom = asyncHandler(async (req, res) => {
  const { roomNo, block, floor, type, capacity } = req.body;

  if (!roomNo) {
    throw new ApiError(400, 'Room number is mandatory');
  }

  const existing = await Room.findOne({ roomNo: roomNo.trim().toUpperCase() });
  if (existing) {
    throw new ApiError(409, `Room ${roomNo} already exists`);
  }

  const room = await Room.create({
    roomNo: roomNo.trim().toUpperCase(),
    block: block || 'Block A',
    floor: floor || '1st Floor',
    type: type || 'Double Occupancy (Attached Washroom)',
    capacity: capacity ? parseInt(capacity, 10) : 2,
    studentIds: [],
  });

  return res.status(201).json(ApiResponse.created(room, 'Room created successfully'));
});

/**
 * @desc    Allocate a student to a room
 * @route   POST /api/v1/rooms/:roomNo/allocate
 * @access  Private (Warden only)
 */
export const allocateRoom = asyncHandler(async (req, res) => {
  const { studentId } = req.body;
  const targetRoomNo = req.params.roomNo.trim().toUpperCase();

  const [student, targetRoom] = await Promise.all([
    Student.findById(studentId),
    Room.findOne({ roomNo: targetRoomNo }),
  ]);

  if (!student) {
    throw new ApiError(404, 'Student not found');
  }
  if (!targetRoom) {
    throw new ApiError(404, `Target room ${targetRoomNo} not found`);
  }

  if (targetRoom.available <= 0 && !targetRoom.studentIds.includes(student._id)) {
    throw new ApiError(400, `Room ${targetRoomNo} is fully occupied`);
  }

  const previousRoomNo = student.roomNo;

  // Remove student from old room if changed
  if (previousRoomNo && previousRoomNo !== targetRoomNo) {
    const prevRoom = await Room.findOne({ roomNo: previousRoomNo });
    if (prevRoom) {
      prevRoom.studentIds = prevRoom.studentIds.filter(
        (id) => id.toString() !== student._id.toString()
      );
      await prevRoom.save();
    }
  }

  // Add to target room if not already inside
  if (!targetRoom.studentIds.some((id) => id.toString() === student._id.toString())) {
    targetRoom.studentIds.push(student._id);
    await targetRoom.save();
  }

  student.roomNo = targetRoomNo;
  student.block = targetRoom.block;
  await student.save();

  // Audit activity
  await Activity.create({
    studentName: student.name,
    enrollmentNo: student.enrollmentNo,
    roomNo: targetRoomNo,
    type: 'ROOM_REALLOCATED',
    title: 'Room Allocated / Moved',
    description: `Allocated to ${targetRoomNo} (${targetRoom.block}) from ${previousRoomNo || 'None'}.`,
    badgeType: 'info',
  });

  return res.status(200).json(
    ApiResponse.success(
      { student, room: targetRoom },
      `Student ${student.name} successfully assigned to ${targetRoomNo}`
    )
  );
});
