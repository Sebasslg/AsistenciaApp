document.addEventListener('DOMContentLoaded', () => {
    console.log('El DOM está listo y scripts.js está cargando!'); // Mensaje en consola
    alert('¡scripts.js ha sido cargado exitosamente!'); // Alerta visible

    // --- Tu lógica de login y dashboard iría aquí ---

    const loginForm = document.getElementById('login-form');
    // ... (resto de tu código de scripts.js) ...

    // Lógica para los botones de Entrada y Salida (CA-01)
    const entradaBtn = document.getElementById('entrada-btn');
    const salidaBtn = document.getElementById('salida-btn');

    if (entradaBtn) {
        entradaBtn.addEventListener('click', () => {
            console.log('Entrada registrada');
            alert('Entrada registrada correctamente.');
        });
    }
    if (salidaBtn) {
        salidaBtn.addEventListener('click', () => {
            console.log('Salida registrada');
            alert('Salida registrada correctamente.');
        });
    }
});