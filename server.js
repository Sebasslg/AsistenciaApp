// -------------------- IMPORTS --------------------
const express = require('express');
const path = require('path');
const { User, Attendance, sequelize, Sequelize } = require('./models');
const { Op } = Sequelize;

// -------------------- CONFIGURACIÓN --------------------
const app = express();
const port = 3004;

// Middleware para archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// Middleware para parsear JSON y formularios
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// -------------------- RUTAS DE VISTAS --------------------

// Login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// -------------------- RUTAS API --------------------

// LOGIN
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email, password } });
        if (user) {
            return res.json({ success: true, message: 'Autenticación exitosa', role: user.role });
        }
        res.status(401).json({ success: false, message: 'Correo o contraseña incorrectos' });
    } catch (error) {
        console.error('Error de autenticación:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

// -------------------- USUARIOS (ADMIN) --------------------

// Obtener usuarios
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.findAll({ attributes: { exclude: ['password'] } });
        res.json(users);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
    }
});

// Crear usuario
app.post('/api/users', async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(409).json({ success: false, message: 'Correo ya en uso.' });

        const newUser = await User.create({ email, password, role });
        const { password: _, ...userWithoutPassword } = newUser.get({ plain: true });
        res.status(201).json({ success: true, message: 'Usuario creado', user: userWithoutPassword });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ success: false, message: 'Error al crear usuario' });
    }
});

// Actualizar usuario
app.put('/api/users/:id', async (req, res) => {
    const userId = req.params.id;
    const { email, password, role } = req.body;
    try {
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) return res.status(409).json({ success: false, message: 'Correo ya en uso' });
        }

        await user.update({ email, password, role });
        const { password: _, ...updatedUserWithoutPassword } = user.get({ plain: true });
        res.json({ success: true, message: 'Usuario actualizado', user: updatedUserWithoutPassword });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar usuario' });
    }
});

// Eliminar usuario
app.delete('/api/users/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

        await user.destroy();
        res.json({ success: true, message: 'Usuario eliminado' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar usuario' });
    }
});

// -------------------- REPORTES --------------------

// Entradas atrasadas
app.get('/api/reports/late-entries', async (req, res) => {
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
        console.error('Error reporte atrasos:', error);
        res.status(500).json({ success: false, message: 'Error al generar reporte' });
    }
});

// Salidas anticipadas
app.get('/api/reports/early-exits', async (req, res) => {
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
        console.error('Error reporte salidas:', error);
        res.status(500).json({ success: false, message: 'Error al generar reporte' });
    }
});

// Inasistencias
app.get('/api/reports/absences', async (req, res) => {
    try {
        const users = await User.findAll();
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
        console.error('Error reporte inasistencias:', error);
        res.status(500).json({ success: false, message: 'Error al generar reporte' });
    }
});

// -------------------- ASISTENCIA --------------------

// Registrar asistencia
app.post('/api/attendance', async (req, res) => {
    const { email, type } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

        const attendance = await Attendance.create({ userId: user.id, type, timestamp: new Date() });
        res.json({ success: true, attendance });
    } catch (error) {
        console.error('Error registrando asistencia:', error);
        res.status(500).json({ success: false, message: 'Error al registrar asistencia' });
    }
});

// Última marca
app.get('/api/attendance/last/:email', async (req, res) => {
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
        console.error('Error obteniendo última marca:', error);
        res.status(500).json({ success: false, message: 'Error al obtener última marca' });
    }
});

// -------------------- INICIAR SERVIDOR --------------------
sequelize.sync()
    .then(() => {
        console.log('Base de datos conectada y sincronizada');
        app.listen(port, () => {
            console.log(`Servidor corriendo en http://localhost:${port}`);
        });
    })
    .catch(error => {
        console.error('Error al conectar a la base de datos:', error);
    });
