// Inicializa el socket para la comunicación en tiempo real
const socket = io();

let username;

// Referencias a elementos de la interfaz
const loginContainer = document.getElementById('login-container');
const mainContainer = document.getElementById('main-container');
const header = document.getElementById('header');
const footer = document.getElementById('footer');
const usernameInput = document.getElementById('username-input');
const loginBtn = document.getElementById('login-btn');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const fileInput = document.getElementById('file-input');
const userList = document.getElementById('user-list');
const fileList = document.getElementById('file-list');
const fileHistory = document.getElementById('file-history');
const windowsSection = document.getElementById('windows-section');
const ubuntuSection = document.getElementById('ubuntu-section');

// Navegación del menú
document.getElementById('home-btn').addEventListener('click', showChat);
document.getElementById('profile-btn').addEventListener('click', changeUsername);
document.getElementById('file-history-btn').addEventListener('click', showFileHistory);
document.getElementById('windows-btn').addEventListener('click', showWindowsSection);
document.getElementById('ubuntu-btn').addEventListener('click', showUbuntuSection);

// Funciones para mostrar las secciones correspondientes
function showChat() {
    fileHistory.style.display = 'none';
    windowsSection.style.display = 'none';
    ubuntuSection.style.display = 'none';
    mainContainer.style.display = 'flex';
}

function showFileHistory() {
    mainContainer.style.display = 'none';
    windowsSection.style.display = 'none';
    ubuntuSection.style.display = 'none';
    fileHistory.style.display = 'block';
}

function showWindowsSection() {
    mainContainer.style.display = 'none';
    fileHistory.style.display = 'none';
    ubuntuSection.style.display = 'none';
    windowsSection.style.display = 'block';
}

function showUbuntuSection() {
    mainContainer.style.display = 'none';
    fileHistory.style.display = 'none';
    windowsSection.style.display = 'none';
    ubuntuSection.style.display = 'block';
}

// Iniciar sesión
loginBtn.addEventListener('click', () => {
    username = usernameInput.value.trim();
    if (username) {
        socket.emit('user joined', username);
        loginContainer.style.display = 'none';
        mainContainer.style.display = 'flex';
        header.style.display = 'block';
        footer.style.display = 'block';
    }
});

// Cambiar nombre de usuario
function changeUsername() {
    const newUsername = prompt('Ingresa tu nuevo nombre:');
    if (newUsername) {
        socket.emit('change username', { oldUsername: username, newUsername });
        username = newUsername;
    }
}

// Enviar mensaje
sendBtn.addEventListener('click', () => {
    const message = messageInput.value;
    if (message) {
        socket.emit('chat message', { username, message });
        messageInput.value = '';
    }
});

// Recibir mensaje y mostrar en la interfaz
socket.on('chat message', (data) => {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${data.username}: ${data.message}`;
    messageElement.classList.add(data.username === username ? 'sent' : 'received');
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Desplazar hacia abajo para mostrar el último mensaje
});


// Enviar archivo
fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            const fileData = {
                name: file.name,
                type: file.type,
                content: reader.result,
            };
            socket.emit('file upload', fileData);
        };
        reader.readAsDataURL(file);
    }
});

// Recibir archivo y mostrar enlace de descarga
socket.on('file upload', (fileData) => {
    const link = document.createElement('a');
    link.href = fileData.content;
    link.download = fileData.name;
    link.textContent = `Archivo recibido: ${fileData.name}`;
    messagesDiv.appendChild(link);
});
// Recibir historial de archivos al cargar la página
socket.on('file history', (files) => {
    fileList.innerHTML = ''; // Limpiar lista actual
    files.forEach((fileData) => {
        const fileItem = document.createElement('li');
        fileItem.innerHTML = `<a href="${fileData.content}" download="${fileData.name}">${fileData.name}</a> por ${fileData.username}`;
        fileList.appendChild(fileItem);
    });
});

// Actualizar lista de usuarios conectados
socket.on('update user list', (users) => {
    userList.innerHTML = ''; // Limpiar la lista actual
    users.forEach((user) => {
        const userItem = document.createElement('li');
        userItem.textContent = user;
        userList.appendChild(userItem);
    });
});
