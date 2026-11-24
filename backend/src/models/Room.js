import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    roomNo: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    block: {
      type: String,
      required: true,
      default: 'Block A',
    },
    floor: {
      type: String,
      required: true,
      default: '1st Floor',
    },
    type: {
      type: String,
      default: 'Double Occupancy (Attached Washroom)',
    },
    capacity: {
      type: Number,
      required: true,
      default: 2,
    },
    occupied: {
      type: Number,
      default: 0,
    },
    available: {
      type: Number,
      default: 2,
    },
    studentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Auto-calculate available count
roomSchema.pre('save', function (next) {
  this.occupied = this.studentIds.length;
  this.available = Math.max(0, this.capacity - this.occupied);
  next();
});

export const Room = mongoose.model('Room', roomSchema);
export default Room;
