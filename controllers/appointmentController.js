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


const getUserAppointment = async (req, res) => {
  const { userId } = req.params;

  try {
    const appointments = await prisma.appointment.findMany({
      where: { userId },
      include: {
        dentist: true,
        timeSlot: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return res.status(500).json({ error: 'Failed to fetch appointments.' });
  }
};


const cancelAppointment = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Find the appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id }
    });

    if (!appointment) return res.status(404).json({ error: 'Appointment not found.' });

    // 2. Free up the time slot
    await prisma.timeSlot.update({
      where: { id: appointment.timeSlotId },
      data: { isBooked: false }
    });

    // 3. Delete the appointment
    await prisma.appointment.delete({ where: { id } });

    return res.status(200).json({ message: 'Appointment cancelled successfully.' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return res.status(500).json({ error: 'Failed to cancel appointment.' });
  }
};


const updateAppointment = async (req, res) => {
  const { id } = req.params;
  const { newTimeSlotId } = req.body;

  if (!newTimeSlotId) return res.status(400).json({ error: 'New time slot ID is required.' });

  try {
    // 1. Find the appointment
    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) return res.status(404).json({ error: 'Appointment not found.' });

    // 2. Check if new time slot is available
    const newSlot = await prisma.timeSlot.findUnique({ where: { id: newTimeSlotId } });
    if (!newSlot || newSlot.isBooked) return res.status(400).json({ error: 'Selected time slot is not available.' });

    // 3. Free old slot
    await prisma.timeSlot.update({
      where: { id: appointment.timeSlotId },
      data: { isBooked: false }
    });

    // 4. Book new slot
    await prisma.timeSlot.update({
      where: { id: newTimeSlotId },
      data: { isBooked: true }
    });

    // 5. Update appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { timeSlotId: newTimeSlotId }
    });

    return res.status(200).json({ message: 'Appointment updated successfully.', updatedAppointment });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return res.status(500).json({ error: 'Failed to update appointment.' });
  }
};


module.exports = {
  generateTimeSlots,
  scheduleAppointment,
  getTimeSlots,
  getAllDentists,
  getUserAppointment,
  cancelAppointment,
  updateAppointment
};
