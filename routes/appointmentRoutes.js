const express = require('express');
const router = express.Router();
const AppointmentController = require('../controllers/appointmentController');


router.post('/generate-time-slots', AppointmentController.generateTimeSlots);
router.post('/schedule-appointment', AppointmentController.scheduleAppointment);
router.get('/dentists/:dentistId/slots', AppointmentController.getTimeSlots);
router.get('/dentists', AppointmentController.getAllDentists);
router.get('/users/:userId/appointments', AppointmentController.getUserAppointment);
router.delete('/users/appointments/:id', AppointmentController.cancelAppointment);
router.put('/users/appointments/:id', AppointmentController.updateAppointment);

module.exports = router;
