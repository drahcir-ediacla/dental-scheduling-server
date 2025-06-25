const prisma = require('../prisma/client');

const timeSlotGenerator = async (daysAhead = 15) => {
  const dentists = await prisma.dentist.findMany();

  if (!dentists.length) {
    console.warn('No dentists found. Aborting time slot generation.');
    return;
  }

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
  ];

  const today = new Date();

  for (const dentist of dentists) {
    for (let i = 0; i < daysAhead; i++) {
      const slotDate = new Date(today);
      slotDate.setDate(today.getDate() + i);
      const dateStr = slotDate.toISOString().split('T')[0];

      for (const time of timeSlots) {
        // Check if slot already exists (prevent duplicates)
        const existingSlot = await prisma.timeSlot.findFirst({
          where: {
            dentistId: dentist.id,
            date: dateStr,
            time: time
          }
        });

        if (!existingSlot) {
          await prisma.timeSlot.create({
            data: {
              dentistId: dentist.id,
              date: dateStr,
              time: time,
              isBooked: false
            }
          });
        }
      }
    }
  }

  console.log('Slots generated successfully.');
};

module.exports = {
  timeSlotGenerator
};
