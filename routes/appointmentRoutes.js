const express = require('express');
const router = express.Router();
const AppointmentController = require('../controllers/appointmentController');


router.post('/generate-time-slots', AppointmentController.generateTimeSlots);
router.post('/schedule-appointment', AppointmentController.scheduleAppointment);
router.get('/dentists/:dentistId/slots', AppointmentController.fetchTimeSlots);

module.exports = router;
