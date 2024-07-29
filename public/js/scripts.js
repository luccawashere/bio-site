document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const audioElement = document.getElementById('background-music');
    const playButton = document.getElementById('play-button');
    const pauseButton = document.getElementById('pause-button');
    const descriptionElement = document.getElementById("description");
    const keybindsPopup = document.getElementById('keybinds-popup');
    const keybindsClose = document.getElementById('keybinds-close');
    const bioCard = document.querySelector('.bio-card');
    const descriptionText = descriptionElement.innerText;
    const glowPresets = ['glow-color-1', 'glow-color-2', 'glow-color-3', 'glow-color-4'];
    const beatInterval =2; // milliseconds
    const startTimestamp =9; // start toggling at 33.7s
    const pauseTimestamp1 = 77; // pause color change at 77s
    const resumeTimestamp1 = 127; // resume color change at 127s
    const pauseTimestamp2 = 168; // pause color change at 168s
    const speed = 100; // Typing speed in milliseconds
    const introScreen = document.getElementById('intro-screen');

    let startX, startY, startLeft, startTop;
    let currentPresetIndex = 0;
    let isDragging = false;
    let intervalId = null;
    let index = 0;

    // Update background gradient on mouse move
    document.addEventListener('mousemove', (event) => {
        body.style.setProperty('--mouse-x', `${event.clientX}px`);
        body.style.setProperty('--mouse-y', `${event.clientY}px`);
    });

    function onMouseDown(event) {
        isDragging = true;
        startX = event.clientX;
        startY = event.clientY;
        const style = getComputedStyle(bioCard);
        startLeft = parseFloat(style.left);
        startTop = parseFloat(style.top);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    function onMouseMove(event) {
        if (isDragging) {
            const deltaX = event.clientX - startX;
            const deltaY = event.clientY - startY;
            bioCard.style.left = `${startLeft + deltaX}px`;
            bioCard.style.top = `${startTop + deltaY}px`;
        }
    }

    function onMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
    
    function updateGlowColor() {
        console.log("Updating glow color..."); // Debugging line
        body.classList.remove(...glowPresets);
        body.classList.add(glowPresets[currentPresetIndex]);
        const newAccentColor = getComputedStyle(body).getPropertyValue(`--${glowPresets[currentPresetIndex]}`);
        body.style.setProperty('--accent', newAccentColor.trim());
        currentPresetIndex = (currentPresetIndex + 1) % glowPresets.length;
    }

    function startAutomaticGlowColorChange() {
        if (intervalId) clearInterval(intervalId); // Clear any existing intervals
        intervalId = setInterval(updateGlowColor, beatInterval);
        console.log("Started automatic glow color change."); // Debugging line
    }

    function stopAutomaticGlowColorChange() {
        if (intervalId) clearInterval(intervalId);
        console.log("Stopped automatic glow color change."); // Debugging line
    }

    function checkAudioTime() {
        console.log(`Audio current time: ${audioElement.currentTime}`);

        if (audioElement.currentTime >= startTimestamp && audioElement.currentTime < pauseTimestamp1) {
            if (!intervalId) {
                startAutomaticGlowColorChange();
            }
        } else if (audioElement.currentTime >= pauseTimestamp1 && audioElement.currentTime < resumeTimestamp1) {
            stopAutomaticGlowColorChange();
        } else if (audioElement.currentTime >= resumeTimestamp1 && audioElement.currentTime < pauseTimestamp2) {
            if (!intervalId) {
                startAutomaticGlowColorChange();
            }
        } else if (audioElement.currentTime >= pauseTimestamp2) {
            stopAutomaticGlowColorChange();
        }
    }

    function handleAudioPlay() {
        console.log('Audio is playing');
        audioElement.addEventListener('timeupdate', checkAudioTime);
    }

    function handleAudioEnd() {
        console.log('Audio ended, restarting...');
        // Reset the audio and start over
        audioElement.currentTime = 0;
        audioElement.play().catch(error => {
            console.error("Error playing audio:", error);
        });
    }

    function toggleNavbar() {
        const navbar = document.getElementById('navbar');
        if (navbar) {
            navbar.classList.toggle('show');
            body.classList.toggle('blur-effect');
        }
    }

    function showKeybindsPopup() {
        keybindsPopup.style.display = 'block';
    }

    function hideKeybindsPopup() {
        keybindsPopup.style.display = 'none';
    }

    function initializeEventListeners() {
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Tab') {
                event.preventDefault();
                updateGlowColor();
            } else if (event.key.toLowerCase() === 'f') {
                toggleNavbar();
            } else if (event.key === '/') {
            event.preventDefault(); // Prevent default action
            showKeybindsPopup();
            }
        });

        
        keybindsClose.addEventListener('click', hideKeybindsPopup);

        bioCard.addEventListener('mousedown', onMouseDown);

        document.addEventListener('click', (event) => {
            if (keybindsPopup.style.display === 'block' && !keybindsPopup.contains(event.target) && event.target !== keybindsClose) {
                hideKeybindsPopup();
            }
        });

        document.addEventListener('click', (event) => {
            createRipple(event.clientX, event.clientY);
        });

        audioElement.addEventListener('loadeddata', () => {
            console.log('Audio loaded and ready to play.');
        });

        audioElement.addEventListener('play', handleAudioPlay);
        audioElement.addEventListener('ended', handleAudioEnd);

        playButton.addEventListener('click', () => {
            audioElement.pause();
            playButton.style.display = 'none';
            pauseButton.style.display = 'block';
        });

        pauseButton.addEventListener('click', () => {
            audioElement.play().catch(error => {
                console.error("Error playing audio:", error);
            });
            playButton.style.display = 'block';
            pauseButton.style.display = 'none';
        });

        introScreen.addEventListener('click', () => {
            introScreen.style.display = 'none';
            typeWriter();
            incrementViewCount();
            audioElement.play().catch(error => {
                console.error("Error playing audio:", error);
            });
        });
    }

    function typeWriter() {
        if (index < descriptionText.length) {
            descriptionElement.innerHTML = descriptionText.substring(0, index + 1) + '<span class="caret">|</span>';
            index++;
            setTimeout(typeWriter, speed);
        } else {
            descriptionElement.innerHTML = descriptionText; // Remove caret after typing
        }
    }

    function incrementViewCount() {
        fetch('/view-counter', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                document.getElementById('view-count').innerText = data.count;
            })
            .catch(error => {
                console.error("Error updating view count:", error);
            });
    }

    function createRipple(x, y) {
        // Function to create ripple effect (implementation not provided in the question)
    }

    // Initialize audio and other elements (play/pause, description typing, etc.)
    audioElement.src = "https://r2.e-z.host/f8c14cae-f13f-4fe5-a42f-8815774d026c/cwu1171i.mp3";
    audioElement.pause();

    initializeEventListeners();
});
