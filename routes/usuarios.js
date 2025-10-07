const express = require('express');
const router = express.Router();
const { User } = require('../models');

// Obtener usuarios con paginación opcional
router.get('/', async (req, res) => {
    try {
        const users = await User.findAll({ attributes: { exclude: ['password'] } });
        res.json(users);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
    }
});

// Crear usuario
router.post('/', async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(409).json({ success: false, message: 'Correo ya en uso.' });
        const newUser = await User.create({ email, password, role });
        const { password: _, ...userWithoutPassword } = newUser.get({ plain: true });
        res.status(201).json({ success: true, message: 'Usuario creado', user: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al crear usuario' });
    }
});

// Actualizar usuario
router.put('/:id', async (req, res) => {
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
        res.status(500).json({ success: false, message: 'Error al actualizar usuario' });
    }
});

// Eliminar usuario
router.delete('/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        await user.destroy();
        res.json({ success: true, message: 'Usuario eliminado' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al eliminar usuario' });
    }
});

// Obtener usuario por ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener usuario' });
    }
});

module.exports = router;
