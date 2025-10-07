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


// -------------------- RUTAS API LIMPIAS --------------------

// Login directo aquí (único endpoint que no es CRUD)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email, password } });
        if (user) {
            return res.json({ success: true, message: 'Autenticación exitosa', role: user.role });
        }
        res.status(401).json({ success: false, message: 'Correo o contraseña incorrectos' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

// Modularización de rutas
app.use('/api/users', require('./routes/usuarios'));
app.use('/api/attendance', require('./routes/asistencia'));
app.use('/api/reports', require('./routes/reportes'));

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
