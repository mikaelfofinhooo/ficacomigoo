// State management
let isLetterOpened = false;
let showPaper = false;
let currentPlayingTrack = null;
let playingIntervals = {};
let carouselIndex = 0;
let carouselItems = [];
let carouselDots = [];

// DOM elements
const letterContainer = document.getElementById('letter-container');
const letter = document.getElementById('letter');
const letterText = document.getElementById('letter-text');
const paper = document.getElementById('paper');
const yesButton = document.getElementById('yes-button');
const noButton = document.getElementById('no-button');
const musicCards = document.querySelectorAll('.music-card');
const carousel = document.getElementById('carousel');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const carouselDotsContainer = document.getElementById('carousel-dots');

// Audio elements
const audioElements = [
    document.getElementById('track-0'),
    document.getElementById('track-1'),
    document.getElementById('track-2')
];

// Variáveis para controle do botão Não
let noButtonProximityCheck = null;
const NO_BUTTON_PROXIMITY_RADIUS = 100; // Raio de proximidade em pixels

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeCarousel();
    initializeAudio();
    startNoButtonProximityCheck();
});

function initializeEventListeners() {
    // Letter click event
    letter.addEventListener('click', handleLetterClick);
    
    // Yes button events
    yesButton.addEventListener('click', handleYesClick);
    
    // No button events
    noButton.addEventListener('click', handleNoButtonClick);
    
    // Music card play buttons
    musicCards.forEach((card, index) => {
        const playButton = card.querySelector('.play-button');
        playButton.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMusic(index);
        });
        
        // Click na barra de progresso para buscar
        const progressBar = card.querySelector('.progress-bar');
        progressBar.addEventListener('click', (e) => {
            if (audioElements[index].duration) {
                const rect = progressBar.getBoundingClientRect();
                const clickPosition = (e.clientX - rect.left) / rect.width;
                audioElements[index].currentTime = clickPosition * audioElements[index].duration;
                updateProgressBar(index);
            }
        });
    });
    
    // Carousel navigation
    prevBtn.addEventListener('click', showPrevCarouselItem);
    nextBtn.addEventListener('click', showNextCarouselItem);
}

function initializeAudio() {
    // Configurar eventos para cada áudio
    audioElements.forEach((audio, index) => {
        // Quando os metadados são carregados (duraçāo disponível)
        audio.addEventListener('loadedmetadata', () => {
            const durationElement = musicCards[index].querySelector('.duration');
            durationElement.textContent = formatTime(audio.duration);
        });
        
        // Atualizar o tempo atual durante a reprodução
        audio.addEventListener('timeupdate', () => {
            updateProgressBar(index);
        });
        
        // Quando o áudio termina
        audio.addEventListener('ended', () => {
            stopMusic(index);
            currentPlayingTrack = null;
        });
    });
}

function initializeCarousel() {
    // Get all carousel items
    carouselItems = document.querySelectorAll('.carousel-item');
    
    // Create dots for each carousel item
    carouselItems.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('carousel-dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => showCarouselItem(index));
        carouselDotsContainer.appendChild(dot);
        carouselDots.push(dot);
    });
    
    // Auto-rotate carousel
    setInterval(() => {
        showNextCarouselItem();
    }, 5000);
}

function showCarouselItem(index) {
    // Update carousel index
    carouselIndex = index;
    
    // Move carousel
    carousel.style.transform = `translateX(-${carouselIndex * 100}%)`;
    
    // Update active dot
    carouselDots.forEach((dot, i) => {
        if (i === carouselIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function showNextCarouselItem() {
    carouselIndex = (carouselIndex + 1) % carouselItems.length;
    showCarouselItem(carouselIndex);
}

function showPrevCarouselItem() {
    carouselIndex = (carouselIndex - 1 + carouselItems.length) % carouselItems.length;
    showCarouselItem(carouselIndex);
}

function handleLetterClick() {
    if (isLetterOpened) return;
    
    // Start opening animation
    letter.classList.remove('letter-closed');
    letter.classList.add('letter-opening');
    
    setTimeout(() => {
        letter.classList.remove('letter-opening');
        letter.classList.add('letter-opened');
        isLetterOpened = true;
        
        // Show the paper after a short delay
        setTimeout(() => {
            showPaper = true;
            paper.classList.remove('paper-hidden');
            paper.classList.add('paper-visible');
        }, 300);
    }, 600);
}

function handleYesClick() {
    showToast('success', '❤️ Que alegria! Obrigado por me dar essa chance!', 'Você fez meu coração muito feliz!');
    createHeartAnimation();
}

function handleNoButtonClick() {
    showToast('error', 'Ei, isso não era para funcionar! 😅', 'Você é teimoso mesmo, hein?');
    teleportNoButton();
}

function startNoButtonProximityCheck() {
    noButtonProximityCheck = setInterval(() => {
        checkMouseProximity();
    }, 100); // Verificar a cada 100ms
}

function checkMouseProximity() {
    // Obter a posição do mouse
    document.addEventListener('mousemove', function trackMouse(e) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        // Obter a posição do botão Não
        const buttonRect = noButton.getBoundingClientRect();
        const buttonCenterX = buttonRect.left + buttonRect.width / 2;
        const buttonCenterY = buttonRect.top + buttonRect.height / 2;
        
        // Calcular a distância entre o mouse e o botão
        const distance = Math.sqrt(
            Math.pow(mouseX - buttonCenterX, 2) + 
            Math.pow(mouseY - buttonCenterY, 2)
        );
        
        // Se o mouse estiver muito perto, teleportar o botão
        if (distance < NO_BUTTON_PROXIMITY_RADIUS) {
            teleportNoButton();
        }
        
        // Remover o event listener após verificar
        document.removeEventListener('mousemove', trackMouse);
    });
}

function teleportNoButton() {
    // Posições pré-definidas em porcentagem para cobrir toda a tela
    const positions = [
        { left: '10%', top: '10%' },    // Canto superior esquerdo
        { left: '80%', top: '10%' },    // Canto superior direito
        { left: '10%', top: '80%' },    // Canto inferior esquerdo
        { left: '80%', top: '80%' },    // Canto inferior direito
        { left: '40%', top: '20%' },    // Centro superior
        { left: '40%', top: '70%' },    // Centro inferior
        { left: '20%', top: '40%' },    // Centro esquerdo
        { left: '70%', top: '40%' },    // Centro direito
        { left: '5%', top: '50%' },     // Esquerda meio
        { left: '90%', top: '50%' },    // Direita meio
        { left: '50%', top: '5%' },     // Topo centro
        { left: '50%', top: '90%' }     // Fundo centro
    ];
    
    // Escolher uma posição aleatória
    const randomPosition = positions[Math.floor(Math.random() * positions.length)];
    
    // Remover qualquer transição/animação existente
    noButton.style.transition = 'none';
    noButton.style.animation = 'none';
    
    // Forçar reflow para garantir que as mudanças sejam aplicadas
    noButton.offsetHeight;
    
    // Aplicar nova posição usando fixed positioning para toda a tela
    noButton.style.position = 'fixed';
    noButton.style.left = randomPosition.left;
    noButton.style.top = randomPosition.top;
    noButton.style.zIndex = '1000'; // Garantir que fique acima de outros elementos
    noButton.style.transform = 'translate(-50%, -50%)'; // Centralizar no ponto
    
    // Adicionar classe para garantir que não há animações
    noButton.classList.add('teleported');
    
    // Mostrar mensagem (apenas ocasionalmente para não ser muito intrusivo)
    if (Math.random() < 0.3) { // 30% de chance
        showToast('error', 'eu acho que você está clicando no botão errado 😅', 'Ele não quer ser clicado...');
    }
}

function toggleMusic(trackIndex) {
    const audioElement = audioElements[trackIndex];
    const card = musicCards[trackIndex];
    const playIcon = card.querySelector('.play-icon');
    const pauseIcon = card.querySelector('.pause-icon');
    
    // Se outro áudio está tocando, pause primeiro
    if (currentPlayingTrack !== null && currentPlayingTrack !== trackIndex) {
        stopMusic(currentPlayingTrack);
    }
    
    if (audioElement.paused) {
        // Iniciar reprodução
        audioElement.play()
            .then(() => {
                playIcon.classList.add('hidden');
                pauseIcon.classList.remove('hidden');
                currentPlayingTrack = trackIndex;
            })
            .catch(error => {
                console.error("Erro ao reproduzir áudio:", error);
                showToast('error', 'Erro de reprodução', 'Não foi possível reproduzir a música.');
            });
    } else {
        // Pausar reprodução
        audioElement.pause();
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
        currentPlayingTrack = null;
    }
}

function stopMusic(trackIndex) {
    const audioElement = audioElements[trackIndex];
    const card = musicCards[trackIndex];
    const playIcon = card.querySelector('.play-icon');
    const pauseIcon = card.querySelector('.pause-icon');
    
    audioElement.pause();
    audioElement.currentTime = 0;
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
    
    // Reset progress bar
    const progressFill = card.querySelector('.progress-fill');
    progressFill.style.width = '0%';
    
    // Reset time display
    const currentTimeElement = card.querySelector('.current-time');
    currentTimeElement.textContent = '0:00';
}

function updateProgressBar(trackIndex) {
    const audioElement = audioElements[trackIndex];
    const card = musicCards[trackIndex];
    const progressFill = card.querySelector('.progress-fill');
    const currentTimeElement = card.querySelector('.current-time');
    
    if (audioElement.duration) {
        const percent = (audioElement.currentTime / audioElement.duration) * 100;
        progressFill.style.width = `${percent}%`;
        currentTimeElement.textContent = formatTime(audioElement.currentTime);
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function createHeartAnimation() {
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.innerHTML = '❤️';
            heart.style.position = 'fixed';
            heart.style.left = Math.random() * window.innerWidth + 'px';
            heart.style.top = window.innerHeight + 'px';
            heart.style.fontSize = '2rem';
            heart.style.zIndex = '1000';
            heart.style.animation = 'heartFloat 3s ease-out forwards';
            heart.style.pointerEvents = 'none';
            
            document.body.appendChild(heart);
            
            setTimeout(() => {
                document.body.removeChild(heart);
            }, 3000);
        }, i * 200);
    }
}

function showToast(type, title, description) {
    const toast = document.getElementById('toast');
    const toastIcon = toast.querySelector('.toast-icon');
    const toastTitle = toast.querySelector('.toast-title');
    const toastDescription = toast.querySelector('.toast-description');
    
    // Remove existing classes
    toast.classList.remove('toast-success', 'toast-error');
    
    // Add appropriate class
    toast.classList.add(`toast-${type}`);
    
    // Set content
    toastTitle.textContent = title;
    toastDescription.textContent = description;
    
    // Show toast
    toast.classList.remove('toast-hidden');
    toast.classList.add('toast-visible');
    
    // Hide toast after delay
    setTimeout(() => {
        toast.classList.remove('toast-visible');
        toast.classList.add('toast-hidden');
    }, type === 'success' ? 5000 : 2000);
}

// Handle window resize for responsive behavior
window.addEventListener('resize', () => {
    // Se o botão estiver com posicionamento fixo, reposicioná-lo
    if (noButton.style.position === 'fixed') {
        teleportNoButton();
    }
});