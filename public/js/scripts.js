document.addEventListener('DOMContentLoaded', () => {
    // ===================== ELEMENTOS DEL DOM =====================
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const logoutBtn = document.getElementById('logout-btn');
    const welcomeMessage = document.getElementById('welcome-message');
    const employeeSection = document.getElementById('employee-section');
    const adminSection = document.getElementById('admin-section');
    const entradaBtn = document.getElementById('entrada-btn');
    const salidaBtn = document.getElementById('salida-btn');

    // Modales para gestión de usuarios y reportes
    const usuariosModalElement = document.getElementById('usuariosModal');
    let usuariosModal = null;
    if (usuariosModalElement) {
        usuariosModal = new bootstrap.Modal(usuariosModalElement);
    }

    const userForm = document.getElementById('user-form');
    const userIdInput = document.getElementById('user-id');
    const userEmailInput = document.getElementById('user-email');
    const userPasswordInput = document.getElementById('user-password');
    const userRoleInput = document.getElementById('user-role');
    const userFormTitle = document.getElementById('user-form-title');
    const userTableBody = document.getElementById('user-table-body');

    const reportesModalElement = document.getElementById('reportesModal');
    let reportesModal = null;
    if (reportesModalElement) {
        reportesModal = new bootstrap.Modal(reportesModalElement);
    }

    const reporteAtrasosBtn = document.getElementById('reporte-atrasos-btn');
    const reporteSalidasBtn = document.getElementById('reporte-salidas-btn');
    const reporteInasistenciasBtn = document.getElementById('reporte-inasistencias-btn');
    const reportOutputDiv = document.getElementById('report-output');

    // ===================== VARIABLES DE SESIÓN =====================
    let currentUserRole = localStorage.getItem('userRole');
    let currentUserEmail = localStorage.getItem('userEmail');

    // ===================== FUNCIONES DE AYUDA =====================
    // Formatea fechas para mostrar en tablas y reportes
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleString();
        } catch (error) {
            console.error("Error formatting date:", dateString, error);
            return 'Invalid Date';
        }
    };

    // ===================== AUTENTICACIÓN Y NAVEGACIÓN =====================
    // Redirección según estado de sesión y página actual
    if (loginForm) {
        // Aquí va la lógica de login (más abajo)
    }

    if (window.location.pathname === '/dashboard') {
        if (!currentUserRole) {
            window.location.href = '/';
        }
    } else {
        if (currentUserRole) {
            window.location.href = '/dashboard';
        }
    }

    // ===================== CERRAR SESIÓN =====================
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/';
        });
    }

    // ===================== FORMULARIO DE LOGIN =====================
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            if (!email || !password) {
                if (errorMessage) errorMessage.textContent = 'Por favor, ingresa correo y contraseña.';
                return;
            }

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                if (data.success) {
                    localStorage.setItem('userRole', data.role);
                    localStorage.setItem('userEmail', email);
                    window.location.href = '/dashboard';
                } else {
                    if (errorMessage) errorMessage.textContent = data.message;
                }
            } catch (error) {
                console.error('Login error:', error);
                if (errorMessage) errorMessage.textContent = 'Error de conexión. Intenta de nuevo.';
            }
        });
    }

    // ===================== DASHBOARD: BIENVENIDA Y SECCIONES =====================
    if (welcomeMessage) {
        welcomeMessage.textContent = `Bienvenido, ${currentUserEmail || 'Usuario'}`;

        if (currentUserRole === 'admin') {
            if (employeeSection) employeeSection.style.display = 'none';
            if (adminSection) adminSection.style.display = 'block';
            loadUsersForAdmin();
        } else if (currentUserRole === 'employee') {
            if (employeeSection) employeeSection.style.display = 'block';
            if (adminSection) adminSection.style.display = 'none';
        } else {
            if (employeeSection) employeeSection.style.display = 'none';
            if (adminSection) adminSection.style.display = 'none';
            welcomeMessage.textContent = 'Rol no reconocido. Por favor, cierra sesión y vuelve a iniciarla.';
        }
    }

    // ===================== ASISTENCIA DEL EMPLEADO =====================
    if (currentUserRole === 'employee') {
        if (entradaBtn) {
            entradaBtn.addEventListener('click', async () => {
                try {
                    console.log('Registrando entrada para:', currentUserEmail);
                    alert('Entrada registrada correctamente.');
                } catch (error) {
                    console.error('Error al registrar entrada:', error);
                    alert('Error al registrar entrada.');
                }
            });
        }

        if (salidaBtn) {
            salidaBtn.addEventListener('click', async () => {
                try {
                    console.log('Registrando salida para:', currentUserEmail);
                    alert('Salida registrada correctamente.');
                } catch (error) {
                    console.error('Error al registrar salida:', error);
                    alert('Error al registrar salida.');
                }
            });
        }
    }

    // ===================== GESTIÓN DE USUARIOS (ADMIN) =====================
    function loadUsersForAdmin() {
        if (!userTableBody) return;
        fetch('/api/users')
            .then(res => res.json())
            .then(users => renderUserTable(users))
            .catch(error => {
                console.error('Error cargando usuarios:', error);
                userTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error al cargar usuarios.</td></tr>';
            });
    }

    // Renderiza la tabla de usuarios en el panel de administración
    function renderUserTable(users) {
        userTableBody.innerHTML = '';
        if (users.length === 0) {
            userTableBody.innerHTML = '<tr><td colspan="4" class="text-center">No hay usuarios registrados.</td></tr>';
            return;
        }
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.email}</td>
                <td>${user.role === 'employee' ? 'Empleado' : 'Administrador'}</td>
                <td>
                    <button class="btn btn-sm btn-warning edit-btn" data-id="${user.id}">Editar</button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${user.id}">Eliminar</button>
                </td>
            `;
            userTableBody.appendChild(row);
        });
    }

    // Eventos para abrir modal de usuarios y gestionar usuarios
    if (currentUserRole === 'admin') {
        const userManagementTrigger = document.querySelector('[data-bs-target="#usuariosModal"]');
        if (userManagementTrigger) {
            userManagementTrigger.addEventListener('click', () => {
                if (usuariosModal) {
                    userForm.reset();
                    userIdInput.value = '';
                    userFormTitle.textContent = 'Crear Nuevo Usuario';
                    loadUsersForAdmin();
                }
            });
        }

        // Guardar o editar usuario
        if (userForm) {
            userForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const id = userIdInput.value;
                const email = userEmailInput.value.trim();
                const password = userPasswordInput.value;
                const role = userRoleInput.value;

                if (!email || !password || !role) {
                    alert('Por favor, completa todos los campos.');
                    return;
                }

                const userData = { email, password, role };
                const isEditing = id !== '';
                const method = isEditing ? 'PUT' : 'POST';
                const url = isEditing ? `/api/users/${id}` : '/api/users';

                try {
                    const response = await fetch(url, {
                        method: method,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(userData)
                    });

                    const data = await response.json();
                    if (data.success) {
                        alert(data.message);
                        userForm.reset();
                        userIdInput.value = '';
                        userFormTitle.textContent = 'Crear Nuevo Usuario';
                        if (usuariosModal) usuariosModal.hide();
                        loadUsersForAdmin();
                    } else {
                        alert(data.message);
                    }
                } catch (error) {
                    console.error('Error saving user:', error);
                    alert('Error de conexión al guardar usuario.');
                }
            });
        }

        // Editar o eliminar usuario desde la tabla
        if (userTableBody) {
            userTableBody.addEventListener('click', async (e) => {
                const target = e.target;
                const userId = target.dataset.id;

                if (target.classList.contains('edit-btn')) {
                    try {
                        const response = await fetch(`/api/users/${userId}`);
                        const userData = await response.json();

                        if (userData && !userData.success && !userData.message) {
                            if (usuariosModal) {
                                userFormTitle.textContent = 'Editar Usuario';
                                userIdInput.value = userData.id;
                                userEmailInput.value = userData.email;
                                userPasswordInput.value = userData.password;
                                userRoleInput.value = userData.role;
                                usuariosModal.show();
                            }
                        } else if (userData.success === false) {
                            alert(userData.message || 'No se pudo obtener la información del usuario.');
                        } else {
                            alert('Respuesta inesperada del servidor al editar.');
                        }
                    } catch (error) {
                        console.error('Error fetching user for edit:', error);
                        alert('Error de conexión al intentar editar.');
                    }
                } else if (target.classList.contains('delete-btn')) {
                    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
                        try {
                            const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
                            const data = await response.json();
                            if (data.success) {
                                alert(data.message);
                                loadUsersForAdmin();
                            } else {
                                alert(data.message);
                            }
                        } catch (error) {
                            console.error('Error deleting user:', error);
                            alert('Error de conexión al intentar eliminar.');
                        }
                    }
                }
            });
        }
    }

    // ===================== REPORTES (ADMIN) =====================
    if (currentUserRole === 'admin') {
        // Función para cargar reportes desde el backend
        const loadReport = async (endpoint, title) => {
            if (!reportOutputDiv) return;
            try {
                const response = await fetch(`/api/reports/${endpoint}`);
                const data = await response.json();

                if (data.success !== false) {
                    displayReport(title, data);
                } else {
                    reportOutputDiv.innerHTML = `<p class="text-danger">Error al generar el reporte: ${data.message}</p>`;
                }
            } catch (error) {
                console.error(`Error fetching ${endpoint} report:`, error);
                reportOutputDiv.innerHTML = '<p class="text-danger">Error de conexión al generar el reporte.</p>';
            }
        };

        // Botones para generar reportes
        if (reporteAtrasosBtn) {
            reporteAtrasosBtn.addEventListener('click', () => loadReport('late-entries', 'Reporte de Entradas Atrasadas'));
        }
        if (reporteSalidasBtn) {
            reporteSalidasBtn.addEventListener('click', () => loadReport('early-exits', 'Reporte de Salidas Anticipadas'));
        }
        if (reporteInasistenciasBtn) {
            reporteInasistenciasBtn.addEventListener('click', () => loadReport('absences', 'Reporte de Inasistencias'));
        }

        // Muestra los datos del reporte en una tabla
        const displayReport = (title, data) => {
            reportOutputDiv.innerHTML = `<h3>${title}</h3>`;
            if (!data || data.length === 0) {
                reportOutputDiv.innerHTML += '<p>No hay datos para mostrar en este reporte.</p>';
                return;
            }

            const table = document.createElement('table');
            table.className = 'table table-striped mt-3';

            const headers = Object.keys(data[0]);
            let theadHtml = '<thead><tr>';
            headers.forEach(header => {
                const formattedHeader = header.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
                theadHtml += `<th>${formattedHeader}</th>`;
            });
            theadHtml += '</tr></thead>';
            table.innerHTML = theadHtml;

            let tbodyHtml = '<tbody>';
            data.forEach(row => {
                tbodyHtml += '<tr>';
                headers.forEach(header => {
                    let cellValue = row[header];
                    if (header.toLowerCase().includes('time') || header.toLowerCase().includes('date') || header.toLowerCase().includes('at')) {
                        cellValue = formatDate(cellValue);
                    }
                    tbodyHtml += `<td>${cellValue !== null ? cellValue : 'N/A'}</td>`;
                });
                tbodyHtml += '</tr>';
            });
            tbodyHtml += '</tbody>';
            table.innerHTML += tbodyHtml;

            reportOutputDiv.appendChild(table);
        };
    }

    // ===================== INICIALIZACIÓN ADICIONAL =====================
    const initModals = () => {
        // Ya se inicializaron arriba con new bootstrap.Modal(...)
    };

    initModals();
});