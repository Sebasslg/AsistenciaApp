const express = require('express');
const router = express.Router();
const { User, Attendance, Sequelize } = require('../models');
const { Op } = Sequelize;

// Entradas atrasadas
router.get('/late-entries', async (req, res) => {
    try {
        const today = new Date().toISOString().slice(0, 10);
        const lateEntries = await Attendance.findAll({
            where: {
                type: 'entrada',
                timestamp: { [Op.gt]: new Date(`${today}T09:00:00`) }
            },
            include: [{ model: User, as: 'user', attributes: ['email'] }]
        });
        const result = lateEntries.map(a => ({ email: a.user.email, entryTime: a.timestamp }));
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al generar reporte' });
    }
});

// Salidas anticipadas
router.get('/early-exits', async (req, res) => {
    try {
        const today = new Date().toISOString().slice(0, 10);
        const earlyExits = await Attendance.findAll({
            where: {
                type: 'salida',
                timestamp: { [Op.lt]: new Date(`${today}T18:00:00`) }
            },
            include: [{ model: User, as: 'user', attributes: ['email'] }]
        });
        const result = earlyExits.map(a => ({ email: a.user.email, exitTime: a.timestamp }));
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al generar reporte' });
    }
});

// Inasistencias (solo empleados)
router.get('/absences', async (req, res) => {
    try {
        const users = await User.findAll({ where: { role: 'employee' } });
        const today = new Date().toISOString().slice(0, 10);
        const entriesToday = await Attendance.findAll({
            where: {
                type: 'entrada',
                timestamp: {
                    [Op.gte]: new Date(`${today}T00:00:00`),
                    [Op.lt]: new Date(`${today}T23:59:59`)
                }
            }
        });
        const presentUserIds = entriesToday.map(a => a.userId);
        const absents = users.filter(u => !presentUserIds.includes(u.id));
        const result = absents.map(u => ({ email: u.email, date: today }));
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al generar reporte' });
    }
});

module.exports = router;
