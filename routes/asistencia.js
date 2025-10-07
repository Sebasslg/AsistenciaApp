const express = require('express');
const router = express.Router();
const { User, Attendance } = require('../models');

// Registrar asistencia
router.post('/', async (req, res) => {
    const { email, type } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        const attendance = await Attendance.create({ userId: user.id, type, timestamp: new Date() });
        res.json({ success: true, attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al registrar asistencia' });
    }
});

// Última marca
router.get('/last/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        const lastEntry = await Attendance.findOne({
            where: { userId: user.id, type: 'entrada' },
            order: [['timestamp', 'DESC']]
        });
        const lastExit = await Attendance.findOne({
            where: { userId: user.id, type: 'salida' },
            order: [['timestamp', 'DESC']]
        });
        res.json({
            success: true,
            lastEntry: lastEntry ? lastEntry.timestamp : null,
            lastExit: lastExit ? lastExit.timestamp : null
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener última marca' });
    }
});

module.exports = router;
