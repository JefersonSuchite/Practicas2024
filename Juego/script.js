const character = document.getElementById('character');
const ammoDisplay = document.getElementById('ammo');
const livesDisplay = document.getElementById('lives');
const reloadBarContainer = document.getElementById('reload-bar-container');
const reloadBar = document.getElementById('reload-bar');
const gameOverDisplay = document.getElementById('game-over');
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');
const resumeButton = document.getElementById('resume-button');
const livesContainer = document.getElementById('lives-container');
const ammoContainer = document.getElementById('ammo-container');
const speedDisplay = document.getElementById('speed'); // Elemento para mostrar la aceleración
const scoreDisplay = document.getElementById('score');

// Variables iniciales de juego
let ammoCount = 3; // Munición inicial
let lives = 5; // Vidas iniciales
let score = 0; // Puntaje inicial
let isReloading = false; // Estado de recarga de munición
let lastDirection = 'left'; // Dirección inicial del personaje
let gamePaused = false; // Estado de pausa del juego
let moveSpeed = 15; // Velocidad de movimiento
let obstacleFrequency = 2000; // Frecuencia de aparición de obstáculos (milisegundos)
let hasBoost = false; // Estado del power-up de velocidad
let hasExtraAmmo = false; // Estado del power-up de munición extra

// Eventos para el botón de inicio, pausa y reanudar
startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', pauseGame);
resumeButton.addEventListener('click', resumeGame);
// Evento de teclado para controles del juego
document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') startGame(); // Inicia el juego con Enter
    if (gamePaused) return; // Si el juego está en pausa, no hacer nada

    // Movimiento y acciones basadas en teclas presionadas
    switch (event.key) {
        case 'w': moveCharacter(0, -moveSpeed, 'up'); break;
        case 's': moveCharacter(0, moveSpeed, 'down'); break;
        case 'a': moveCharacter(-moveSpeed, 0, 'left'); break;
        case 'd': moveCharacter(moveSpeed, 0, 'right'); break;
        case 'f': attack(); break; // Disparar
        case 'r': reloadAmmo(); break; // Recargar munición
        case 'Shift': increaseSpeed(); break; // Aumentar velocidad
        case 'p': pauseGame(); break; // Pausar juego
    }
});

// Función para iniciar el juego
function startGame() {
    playBackgroundMusic(); 
    gamePaused = false; // Quitar pausa
    score = 0; // Reiniciar puntaje
    scoreDisplay.textContent = `Puntaje: ${score}`; // Mostrar puntaje
    startButton.style.display = 'none'; // Ocultar botón de inicio
    createObstacles(); // Crear obstáculos
    updateStatus('Game started'); // Actualizar mensaje de estado
    updateLifeIndicators(); // Actualizar indicadores de vida
    updateAmmoIndicators(); // Actualizar indicadores de munición
    speedDisplay.textContent = 'Aceleración: No Disponible'; // Mostrar estado de aceleración
}

// Función para pausar el juego
function pauseGame() {
    gamePaused = true; // Activar pausa
    pauseButton.style.display = 'none'; // Ocultar botón de pausa
    resumeButton.style.display = 'block'; // Mostrar botón de reanudar
    updateStatus('Game paused'); // Actualizar mensaje de estado
}

// Función para reanudar el juego
function resumeGame() {
    gamePaused = false; // Quitar pausa
    resumeButton.style.display = 'none'; // Ocultar botón de reanudar
    pauseButton.style.display = 'block'; // Mostrar botón de pausa
    updateStatus('Game resumed'); // Actualizar mensaje de estado
}

function moveCharacter(dx, dy, direction) {
    lastDirection = direction;
    const currentLeft = parseInt(character.style.left) || 400;
    const currentTop = parseInt(character.style.top) || 0;
    character.style.left = `${Math.max(0, Math.min(780, currentLeft + dx))}px`;
    character.style.top = `${Math.max(0, Math.min(380, currentTop + dy))}px`;
}

// Función para disparar
function attack() {
    if (ammoCount <= 0) return; // Si no hay munición, no disparar
    ammoCount--; // Disminuir munición
    ammoDisplay.textContent = `Munición: ${ammoCount}`; // Actualizar display de munición
    updateAmmoIndicators(); // Actualizar indicadores de munición
    spawnProjectile(); // Crear proyectil
    playShootSound(); // Reproducir el sonido de disparo
}
// Función para reproducir un sonido de disparo
function playShootSound() {
    const audio = new Audio('gun.mp3'); // Especifica la ruta del sonido
    audio.play(); // Reproducir el sonido
}
// Función para reproducir un sonido al recibir daño
function playDamageSound() {
    const audio = new Audio('hurt.mp3'); // Especifica la ruta del sonido de daño
    audio.play(); // Reproducir el sonido
}

// Función para reproducir un sonido de Game Over
function playGameOverSound() {
    const audio = new Audio('die.mp3'); // Especifica la ruta del sonido de game over
    audio.play(); // Reproducir el sonido
}

function playReloadLaserSound() {
    const audio = new Audio('Reload-Laser.mp3');
    audio.play(); // Reproducir el sonido
}

// Función para crear un proyectil
function spawnProjectile() {
    const projectile = document.createElement('div'); // Crear elemento de proyectil
    projectile.classList.add('projectile'); // Añadir clase de proyectil
    projectile.style.left = `${parseInt(character.style.left) + 25}px`; // Posición inicial izquierda
    projectile.style.top = `${parseInt(character.style.top) + 25}px`; // Posición inicial superior
    document.getElementById('game-container').appendChild(projectile); // Añadir al contenedor del juego

    // Direcciones del proyectil según la última dirección del personaje
    let dx = 0, dy = 0;
    if (lastDirection === 'up') dy = -10;
    else if (lastDirection === 'down') dy = 10;
    else if (lastDirection === 'left') dx = -10;
    else if (lastDirection === 'right') dx = 10;

    // Mover proyectil periódicamente y verificar colisiones
    const interval = setInterval(() => {
        projectile.style.left = `${parseInt(projectile.style.left) + dx}px`;
        projectile.style.top = `${parseInt(projectile.style.top) + dy}px`;

        // Verificar colisión del proyectil con obstáculos
        document.querySelectorAll('.obstacle').forEach(obstacle => {
            if (checkCollision(projectile.getBoundingClientRect(), obstacle.getBoundingClientRect())) {
                obstacle.hitCount = (obstacle.hitCount || 0) + 1;
                if (obstacle.hitCount >= obstacle.requiredHits) {
                    obstacle.remove(); // Remover obstáculo si se alcanzan los golpes requeridos
                    score += 10; // Incrementar puntaje
                    scoreDisplay.textContent = `Puntaje: ${score}`; // Mostrar puntaje actualizado
                }
                projectile.remove(); // Remover proyectil
                clearInterval(interval); // Detener movimiento del proyectil
            }
        });
    }, 50);
}

// Función para recargar munición
function reloadAmmo() {
    if (isReloading) return; // Si está en proceso de recarga, no hacer nada
    playReloadLaserSound()
    isReloading = true; // Iniciar recarga
    reloadBarContainer.style.display = 'block'; // Mostrar barra de recarga
    reloadBar.style.width = '0'; // Inicializar barra de recarga
    setTimeout(() => {
        ammoCount = 3; // Restablecer munición
        ammoDisplay.textContent = `Munición: ${ammoCount}`; // Mostrar munición
        updateAmmoIndicators(); // Actualizar indicadores de munición
        reloadBar.style.width = '100%'; // Completar barra de recarga
        isReloading = false; // Finalizar recarga
        reloadBarContainer.style.display = 'none'; // Ocultar barra de recarga
    }, 1500); // Duración de la recarga (ms)
}

function createObstacles() {
    const obstacleInterval = setInterval(() => {
        if (gamePaused) return;
        const obstacle = document.createElement('div');
        obstacle.classList.add('obstacle');
        const size = Math.random() * 50 + 30;
        obstacle.style.width = `${size}px`;
        obstacle.style.height = `${size}px`;
        obstacle.style.left = `${Math.random() > 0.5 ? 0 : 780}px`;
        obstacle.requiredHits = size > 60 ? 3 : size > 40 ? 2 : 1;
        obstacle.hitCount = 0;
        document.getElementById('game-container').appendChild(obstacle);

        const obstacleY = Math.random() * 400;
        obstacle.style.top = `${obstacleY}px`;

        let direction = Math.random() > 0.5 ? 1 : -1;
        const speed = 2;

        const interval = setInterval(() => {
            obstacle.style.left = `${parseInt(obstacle.style.left) + (direction * speed)}px`;

            if (checkCollision(character.getBoundingClientRect(), obstacle.getBoundingClientRect())) {
                lives--;
                livesDisplay.textContent = `Vidas: ${lives}`;
                updateLifeIndicators();
                playDamageSound();
                obstacle.remove();
                if (lives <= 0) endGame();
            }

            if (parseInt(obstacle.style.left) < -50 || parseInt(obstacle.style.left) > 800) {
                clearInterval(interval);
                obstacle.remove();
            }
        }, 50);
    }, obstacleFrequency);

    // Incrementa la dificultad aumentando la frecuencia
    setInterval(() => {
        if (obstacleFrequency > 500) obstacleFrequency -= 100;
    }, 10000);
}

function endGame() {
    gamePaused = true;
    updateStatus('Game Over');
    gameOverDisplay.style.display = 'block';
    setTimeout(() => location.reload(), 3000);
    stopBackgroundMusic();
    playGameOverSound();
}

function updateStatus(message) {
    document.getElementById('status').textContent = `Status: ${message}`;
}

function checkCollision(a, b) {
    return (
        a.left < b.left + b.width &&
        a.left + a.width > b.left &&
        a.top < b.top + b.height &&
        a.top + a.height > b.top
    );
}

function updateLifeIndicators() {
    livesContainer.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const lifeIndicator = document.createElement('div');
        lifeIndicator.classList.add('indicator', 'lives');
        if (i >= lives) {
            lifeIndicator.classList.add('lives-lost');
        }
        livesContainer.appendChild(lifeIndicator);
    }
}

function updateAmmoIndicators() {
    ammoContainer.innerHTML = '';
    for (let i = 0; i < 5; i++) { // Cambia a 5 para mostrar 5 indicadores
        const ammoIndicator = document.createElement('div');
        ammoIndicator.classList.add('indicator', 'ammo');
        if (i >= ammoCount) {
            ammoIndicator.style.backgroundColor = 'gray';
        }
        ammoContainer.appendChild(ammoIndicator);
    }
}

function increaseSpeed() {
    if (hasBoost) {
        moveSpeed = 25;
        playBoostSound()
        speedDisplay.textContent = 'Aceleración: Activada';
        setTimeout(() => {
            moveSpeed = 15;
            speedDisplay.textContent = 'Aceleración: No Disponible';
            hasBoost = false; // Reinicia el estado del boost
        }, 2000); // Regresa a velocidad normal después de 2 segundos
    }
}

// Función para manejar la recogida del boost
function collectBoost() {
    // Solo activar el boost si aún no está activo
    if (!hasBoost) {
        hasBoost = true; // Marcar como que se tiene el impulso
        speedDisplay.textContent = 'Aceleración: Disponible'; // Mostrar estado de aceleración
        // Establecer un temporizador para desactivar el boost después de un tiempo
        setTimeout(() => {
            hasBoost = false; // Reiniciar estado de impulso
            moveSpeed = 15; // Volver a la velocidad normal
            speedDisplay.textContent = 'Aceleración: No Disponible'; // Actualizar estado de aceleración
        }, 2000); // Mantener el boost activo durante 2 segundos

        // Opcional: crear un objeto de boost en el juego
        createBoostObject();
    }
}

// Función para crear un objeto de boost en una posición aleatoria
function createBoostObject() {
    const boostObject = document.createElement('div'); // Crear elemento de boost
    boostObject.classList.add('boost-object'); // Añadir clase CSS para el estilo del boost

    // Posición aleatoria en el contenedor de juego
    boostObject.style.left = `${Math.floor(Math.random() * 750)}px`;
    boostObject.style.top = `${Math.floor(Math.random() * 350)}px`;

    // Añadir el objeto al contenedor del juego
    document.getElementById('game-container').appendChild(boostObject);

    // Detectar colisión del personaje con el boost
    const checkBoostCollision = setInterval(() => {
        if (checkCollision(character.getBoundingClientRect(), boostObject.getBoundingClientRect())) {
            collectBoost(); // Recolectar el boost
            boostObject.remove(); // Remover el objeto de boost del juego
            clearInterval(checkBoostCollision); // Detener detección de colisiones
        }
    }, 50);
}

// Llamar a `createBoostObject` periódicamente
setInterval(() => {
    if (!gamePaused && !hasBoost) { // Solo crear si el juego no está pausado y no hay boost activo
        createBoostObject();
    }
}, 10000); // Crear boost cada 10 segundos

// Función para reproducir un sonido de boost
function playBoostSound() {
    const audio = new Audio('boost-sound.mp3'); // Crear un nuevo objeto de audio
    audio.play(); // Reproducir el sonido
}

// Función para manejar la recogida de munición extra
function collectExtraAmmo() {
    hasExtraAmmo = true;
    ammoCount = 5; // Aumenta a 5 municiones
    ammoDisplay.textContent = `Munición: ${ammoCount}`;
    setTimeout(() => {
        hasExtraAmmo = false;
        ammoCount = 3; // Regresa a 3 municiones después de 10 segundos
        ammoDisplay.textContent = `Munición: ${ammoCount}`;
    }, 10000); // Regresa a 3 después de 10 segundos
}

function startReloadAnimation() {
    const reloadBar = document.getElementById('reload-bar');
    reloadBar.style.width = '100%';
    setTimeout(() => {
        reloadBar.style.width = '0%';
    }, 1000); // Duración de la recarga
}

let backgroundMusic; // Variable para almacenar la música de fondo

// Función para reproducir la música de fondo
function playBackgroundMusic() {
    backgroundMusic = new Audio('Game-Sound.mp3'); // Especifica la ruta del sonido de fondo
    backgroundMusic.loop = true; // Configura la música para que se repita
    backgroundMusic.volume = 0.5; // Ajusta el volumen si es necesario
    backgroundMusic.play(); // Reproducir la música
}

// Función para detener la música de fondo
function stopBackgroundMusic() {
    if (backgroundMusic) {
        backgroundMusic.pause(); // Pausar la música
        backgroundMusic.currentTime = 0; // Reiniciar el tiempo de la música
    }
}