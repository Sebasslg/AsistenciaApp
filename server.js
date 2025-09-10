// -------------------- IMPORTS --------------------
const express = require('express');
const path = require('path');
const { User, sequelize } = require('./models'); // Modelo y instancia de Sequelize

// -------------------- CONFIG --------------------
const app = express();
const port = 3004;

// Middleware para servir archivos estáticos (CSS, JS, Bootstrap)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// Middleware para procesar datos de formularios y JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// -------------------- RUTAS VISTAS --------------------
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/dashboard', (req, res) => {
    // Aquí se podría validar sesión del usuario
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// -------------------- RUTAS API --------------------

// Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email, password } });
        if (user) {
            res.json({ success: true, message: 'Autenticación exitosa', role: user.role });
        } else {
            res.status(401).json({ success: false, message: 'Correo o contraseña incorrectos' });
        }
    } catch (error) {
        console.error('Error de autenticación:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

// -------------------- RUTAS USUARIOS (Admin) --------------------

// Obtener todos los usuarios (sin contraseña)
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });
        res.json(users);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
    }
});

// Crear usuario (GU-01)
app.post('/api/users', async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(409).json({ success: false, message: 'El correo electrónico ya está en uso.' });

        const newUser = await User.create({ email, password, role });
        const { password: _, ...userWithoutPassword } = newUser.get({ plain: true });
        res.status(201).json({ success: true, message: 'Usuario creado exitosamente', user: userWithoutPassword });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ success: false, message: 'Error al crear el usuario' });
    }
});

// Modificar usuario (GU-02)
app.put('/api/users/:id', async (req, res) => {
    const userId = req.params.id;
    const { email, password, role } = req.body;
    try {
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) return res.status(409).json({ success: false, message: 'El correo ya está en uso por otro usuario.' });
        }

        await user.update({ email, password, role });
        const { password: _, ...updatedUserWithoutPassword } = user.get({ plain: true });
        res.json({ success: true, message: 'Usuario actualizado exitosamente', user: updatedUserWithoutPassword });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar el usuario' });
    }
});

// Eliminar usuario (GU-03)
app.delete('/api/users/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

        await user.destroy();
        res.json({ success: true, message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar el usuario' });
    }
});

// -------------------- RUTAS REPORTES --------------------

// Reporte de Entradas Atrasadas (RE-01)
app.get('/api/reports/late-entries', async (req, res) => {
    try {
        const simulatedData = [
            { userId: 1, email: 'empleado1@empresa.com', entryTime: '2025-09-10T09:45:00Z' },
            { userId: 2, email: 'empleado2@empresa.com', entryTime: '2025-09-10T10:05:00Z' },
        ];
        res.json(simulatedData);
    } catch (error) {
        console.error('Error generando reporte de atrasos:', error);
        res.status(500).json({ success: false, message: 'Error al generar reporte de atrasos' });
    }
});

// Reporte de Salidas Anticipadas (RE-02)
app.get('/api/reports/early-exits', async (req, res) => {
    try {
        const simulatedData = [
            { userId: 1, email: 'empleado1@empresa.com', exitTime: '2025-09-10T17:15:00Z' },
        ];
        res.json(simulatedData);
    } catch (error) {
        console.error('Error generando reporte de salidas anticipadas:', error);
        res.status(500).json({ success: false, message: 'Error al generar reporte de salidas anticipadas' });
    }
});

// Reporte de Inasistencias (RE-03)
app.get('/api/reports/absences', async (req, res) => {
    try {
        const simulatedData = [
            { userId: 3, email: 'empleado3@empresa.com', date: '2025-09-10' },
        ];
        res.json(simulatedData);
    } catch (error) {
        console.error('Error generando reporte de inasistencias:', error);
        res.status(500).json({ success: false, message: 'Error al generar reporte de inasistencias' });
    }
});

// -------------------- INICIAR SERVIDOR --------------------
sequelize.sync()
    .then(() => {
        console.log(`✅ Base de datos conectada correctamente`);
        app.listen(port, () => {
            console.log(`🚀 Servidor escuchando en http://localhost:${port}`);
        });
    })
    .catch(error => {
        console.error('❌ Error al conectar a la base de datos:', error);
    });
