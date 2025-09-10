const express = require('express');
const path = require('path');
const app = express();
const { User, sequelize } = require('./models'); // Importa el modelo y la instancia de sequelize
const port = 3004;

// Middleware para servir archivos estáticos (CSS, JS, Bootstrap)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// Middleware para procesar datos de formularios
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rutas para las vistas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/dashboard', (req, res) => {
    // En una implementación real, aquí se validaría la sesión del usuario
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// API para la autenticación
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email: email, password: password } });
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

// Sincroniza los modelos con la base de datos y luego inicia el servidor
sequelize.sync().then(() => {
    app.listen(port, () => {
        console.log(`Servidor escuchando en http://localhost:${port}`);
    });
}).catch(error => {
    console.error('Error al conectar a la base de datos:', error);
});