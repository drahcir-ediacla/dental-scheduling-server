const prisma = require('../prisma/client');
const { timeSlotGenerator } = require('../utils/timeSlotGenerator');


const generateTimeSlots = async (req, res) => {
  try {
    await timeSlotGenerator();
    res.status(200).json({ message: 'Slots generated successfully.' });
  } catch (error) {
    console.error('Slot Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate slots.' });
  }
};

const scheduleAppointment = async (req, res) => {
  const { userId, dentistId, timeSlotId } = req.body;

  if (!userId || !dentistId || !timeSlotId) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    // 1. Check if time slot exists and is available
    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id: timeSlotId },
    });

    if (!timeSlot) {
      return res.status(404).json({ error: 'Time slot not found.' });
    }

    if (timeSlot.isBooked) {
      return res.status(400).json({ error: 'Time slot is already booked.' });
    }

    // 2. Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        userId,
        dentistId,
        timeSlotId,
      },
    });

    // 3. Mark the time slot as booked
    await prisma.timeSlot.update({
      where: { id: timeSlotId },
      data: { isBooked: true },
    });

    return res.status(201).json({ message: 'Appointment booked successfully.', appointment });
  } catch (error) {
    console.error('Booking Error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const getTimeSlots = async (req, res) => {
  const { dentistId } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: 'Date query parameter is required.' });
  }

  try {
    const availableSlots = await prisma.timeSlot.findMany({
      where: {
        dentistId,
        date: date,
        isBooked: false
      },
      orderBy: { time: 'asc' } // Optional: sort time slots
    });

    return res.status(200).json(availableSlots);
  } catch (error) {
    console.error('Error fetching slots:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};


const getAllDentists = async (req, res) => {
  try {
    const dentists = await prisma.dentist.findMany({
      orderBy: { name: 'asc' } // Optional: sort dentists alphabetically
    });

    return res.status(200).json(dentists);
  } catch (error) {
    console.error('Error fetching dentists:', error);
    return res.status(500).json({ error: 'Failed to fetch dentists.' });
  }
};

module.exports = { 
    generateTimeSlots,
    scheduleAppointment,
    getTimeSlots,
    getAllDentists
} ;
