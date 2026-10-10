// 11 «А» сынып — Бақытты сәттер фотобуткасы (QURMASH)

// DOM элементтері
const heartsContainer = document.getElementById('heartsContainer');
const heroCaptureBtn = document.getElementById('heroCaptureBtn');
const photoboothSection = document.getElementById('photoboothSection');
const video = document.getElementById('webcamVideo');
const countdownOverlay = document.getElementById('countdownOverlay');
const countdownNumber = document.getElementById('countdownNumber');
const countdownTip = document.getElementById('countdownTip');
const flashEffect = document.getElementById('flashEffect');
const shotStatusBadge = document.getElementById('shotStatusBadge');
const currentShotText = document.getElementById('currentShotText');
const cameraErrorBox = document.getElementById('cameraErrorBox');
const cameraErrorTitle = document.getElementById('cameraErrorTitle');
const cameraErrorText = document.getElementById('cameraErrorText');
const enableCameraBtn = document.getElementById('enableCameraBtn');
const fileInputUpload = document.getElementById('fileInputUpload');
const startCaptureBtn = document.getElementById('startCaptureBtn');
const flipCameraBtn = document.getElementById('flipCameraBtn');
const filterChips = document.querySelectorAll('.filter-chip');
const layoutChips = document.querySelectorAll('.layout-chip');
const colorBtns = document.querySelectorAll('.color-btn');
const photostripCanvas = document.getElementById('photostripCanvas');
const emptyStripPlaceholder = document.getElementById('emptyStripPlaceholder');
const customStripCaption = document.getElementById('customStripCaption');
const stickerBtns = document.querySelectorAll('.sticker-btn');
const shareBtn = document.getElementById('shareBtn');
const shareStatus = document.getElementById('shareStatus');
const downloadBtn = document.getElementById('downloadBtn');
const retakeBtn = document.getElementById('retakeBtn');

// Музыка элементтері
const musicDisc = document.getElementById('musicDisc');
const musicEqualizer = document.getElementById('musicEqualizer');
const musicToggleBtn = document.getElementById('musicToggleBtn');
const musicStatusText = document.getElementById('musicStatusText');
const localAudioPlayer = document.getElementById('localAudioPlayer');

// Күй айнымалылары
let currentLayout = '2x2'; // 2/2 тор немесе 1x4 лента
let currentStream = null;
let currentFacingMode = 'user';
let currentFilter = 'normal';
let currentFrameColor = '#ffffff';
let capturedPhotos = [];
let selectedStickers = ['💖', '✨', '🎓'];
let isCapturing = false;
let audioCtx = null;
let isMusicPlaying = false;
let userHasInteracted = false;

// 1. Дыбыстық синтезатор (Кері санақ және камера дыбысы)
function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
}

function playBeep(freq = 440, duration = 0.12) {
  try {
    initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.warn('Audio play error:', e);
  }
}

function playShutterSound() {
  try {
    initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const bufferSize = audioCtx.sampleRate * 0.08;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();
  } catch (e) {
    console.warn('Shutter sound error:', e);
  }
}

// 2. Фондық музыка (Ayau — kel kel :))
function setMusicUI(playing) {
  isMusicPlaying = playing;
  if (playing) {
    if (musicDisc) musicDisc.classList.add('playing');
    if (musicEqualizer) musicEqualizer.classList.add('playing');
    if (musicToggleBtn) musicToggleBtn.textContent = '⏸';
    if (musicStatusText) musicStatusText.textContent = 'Ойнап тұр ✦ 25%';
  } else {
    if (musicDisc) musicDisc.classList.remove('playing');
    if (musicEqualizer) musicEqualizer.classList.remove('playing');
    if (musicToggleBtn) musicToggleBtn.textContent = '▶';
    if (musicStatusText) musicStatusText.textContent = 'Тоқтатылды';
  }
}

function playMusic() {
  if (localAudioPlayer) {
    localAudioPlayer.volume = 0.25; // Жай үн (25%)
    localAudioPlayer.play().then(() => {
      setMusicUI(true);
    }).catch(err => {
      console.log('Autoplay waiting for interaction:', err);
    });
  }
}

function pauseMusic() {
  if (localAudioPlayer) {
    localAudioPlayer.pause();
    setMusicUI(false);
  }
}

if (musicToggleBtn) {
  musicToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    initAudio();
    if (isMusicPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  });
}

// Қолданушы экранды басқанда музыканы бастау
function triggerUserInteraction() {
  if (!userHasInteracted) {
    userHasInteracted = true;
    initAudio();
    playMusic();
  }
}
document.addEventListener('click', triggerUserInteraction);
document.addEventListener('touchstart', triggerUserInteraction);

// 3. Фондағы жүректер анимациясы
function createFloatingHearts() {
  if (!heartsContainer) return;
  const symbols = ['❤️', '💖', '💕', '💗', '✨', '🌸', '💐'];
  setInterval(() => {
    if (document.hidden) return;
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.innerText = symbols[Math.floor(Math.random() * symbols.length)];
    heart.style.left = Math.random() * 95 + 'vw';
    heart.style.animationDuration = (6 + Math.random() * 5) + 's';
    heart.style.fontSize = (16 + Math.random() * 22) + 'px';
    heartsContainer.appendChild(heart);

    setTimeout(() => heart.remove(), 11000);
  }, 900);
}

// 4. Веб-камераны қосу
async function startCamera() {
  if (currentStream) {
    currentStream.getTracks().forEach(t => t.stop());
    currentStream = null;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showCameraError(
      'Бұл браузер камераны қолдамайды',
      'Сілтемені Chrome, Edge немесе Safari браузерінде ашыңыз. Немесе галереядан 4 сурет таңдаңыз.'
    );
    return false;
  }

  try {
    if (enableCameraBtn) {
      enableCameraBtn.disabled = true;
      enableCameraBtn.textContent = '⏳ Қосылып жатыр…';
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: currentFacingMode,
        width: { ideal: 1280 },
        height: { ideal: 960 }
      },
      audio: false
    });

    currentStream = stream;
    video.srcObject = stream;
    await video.play();
    if (cameraErrorBox) cameraErrorBox.classList.add('hidden');
    startCaptureBtn.disabled = false;
    return true;
  } catch (err) {
    console.warn('Camera error:', err);
    const permissionDenied = err && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError');
    const cameraBusy = err && (err.name === 'NotReadableError' || err.name === 'TrackStartError');

    if (permissionDenied) {
      showCameraError(
        'Камераға рұқсат берілмеді',
        'Браузер адресінің жанындағы камера белгісін басып, рұқсатты «Allow / Рұқсат ету» деп өзгертіңіз.'
      );
    } else if (cameraBusy) {
      showCameraError(
        'Камера бос емес',
        'Камераны қолданып тұрған Zoom, Telegram немесе басқа қолданбаны жауып, қайта көріңіз.'
      );
    } else {
      showCameraError(
        'Камера ашылмады',
        'Камераны қайта қосып көріңіз немесе галереядан 4 сурет таңдаңыз.'
      );
    }
    return false;
  } finally {
    if (enableCameraBtn) {
      enableCameraBtn.disabled = false;
      enableCameraBtn.textContent = '📷 Камераны қайта қосу';
    }
  }
}

function showCameraError(title, message) {
  if (cameraErrorTitle) cameraErrorTitle.textContent = title;
  if (cameraErrorText) cameraErrorText.textContent = message;
  if (cameraErrorBox) cameraErrorBox.classList.remove('hidden');
  startCaptureBtn.disabled = false;
}

if (enableCameraBtn) {
  enableCameraBtn.addEventListener('click', async () => {
    triggerUserInteraction();
    await startCamera();
  });
}

// Камераны ауыстыру
if (flipCameraBtn) {
  flipCameraBtn.addEventListener('click', () => {
    currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    video.style.transform = currentFacingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)';
    startCamera();
  });
}

// 5. Фильтрлерді таңдау
filterChips.forEach(chip => {
  chip.addEventListener('click', () => {
    filterChips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    currentFilter = chip.dataset.filter;

    video.className = '';
    video.classList.add(`filter-${currentFilter}`);

    if (capturedPhotos.length === 4) {
      renderPhotostrip();
    }
  });
});

// 6. Тор пішімін таңдау (2/2 тор немесе 1x4 лента)
layoutChips.forEach(chip => {
  chip.addEventListener('click', () => {
    layoutChips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    currentLayout = chip.dataset.layout;

    if (capturedPhotos.length === 4) {
      renderPhotostrip();
    }
  });
});

// 7. Рамка түсін таңдау
colorBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    colorBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFrameColor = btn.dataset.color;

    if (capturedPhotos.length === 4) {
      renderPhotostrip();
    }
  });
});

// Тақырып мәтінін өзгерту
if (customStripCaption) {
  customStripCaption.addEventListener('input', () => {
    if (capturedPhotos.length === 4) {
      renderPhotostrip();
    }
  });
}

// Стикерлерді таңдау (фотоны тым жауып кетпес үшін ең көбі 3)
stickerBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const sticker = btn.dataset.sticker;
    const isSelected = selectedStickers.includes(sticker);

    if (isSelected) {
      selectedStickers = selectedStickers.filter(item => item !== sticker);
    } else if (selectedStickers.length < 3) {
      selectedStickers.push(sticker);
    } else {
      setShareStatus('Бір уақытта 3 стикерге дейін таңдауға болады.');
      return;
    }

    btn.classList.toggle('active', !isSelected);
    btn.setAttribute('aria-pressed', String(!isSelected));
    setShareStatus('');

    if (capturedPhotos.length === 4) {
      renderPhotostrip();
    }
  });
});

// «Бақытты кездерді сақтап қалу» батырмасы
if (heroCaptureBtn) {
  heroCaptureBtn.addEventListener('click', () => {
    triggerUserInteraction();
    photoboothSection.scrollIntoView({ behavior: 'smooth' });
    if (!currentStream) {
      startCamera();
    }
  });
}

// Фильтр формуласы
function getCanvasFilterString(filterName) {
  switch (filterName) {
    case 'vintage':
      return 'sepia(0.4) contrast(1.15) brightness(0.95) saturate(1.2)';
    case 'soft-glow':
      return 'contrast(1.05) brightness(1.1) saturate(1.15) blur(0.3px)';
    case 'rosy':
      return 'hue-rotate(-15deg) saturate(1.3) brightness(1.05) contrast(1.05)';
    case 'warm':
      return 'sepia(0.2) saturate(1.4) brightness(1.05)';
    case 'bw':
      return 'grayscale(1) contrast(1.25) brightness(0.95)';
    case 'cyber':
      return 'saturate(1.6) contrast(1.2) hue-rotate(20deg)';
    default:
      return 'none';
  }
}

// Бір кадрды түсіру (сенімді fallback-пен)
function captureFrame() {
  const vW = video.videoWidth || 640;
  const vH = video.videoHeight || 480;
  
  const snapCanvas = document.createElement('canvas');
  snapCanvas.width = vW;
  snapCanvas.height = vH;
  const ctx = snapCanvas.getContext('2d');

  if (currentFacingMode === 'user') {
    ctx.translate(vW, 0);
    ctx.scale(-1, 1);
  }

  ctx.filter = getCanvasFilterString(currentFilter);

  try {
    if (video.readyState >= 2 && video.videoWidth > 0) {
      ctx.drawImage(video, 0, 0, vW, vH);
    } else {
      throw new Error('Video stream not ready');
    }
  } catch (e) {
    // Егер камера болмаса сүйкімді естелік карточкасын саламыз
    ctx.fillStyle = '#ff758f';
    ctx.fillRect(0, 0, vW, vH);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Montserrat, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('❤️ 11 «А» сынып ❤️', vW / 2, vH / 2 - 20);
    ctx.font = '24px Montserrat, sans-serif';
    ctx.fillText('Бақытты сәттер ✨', vW / 2, vH / 2 + 30);
  }

  return snapCanvas.toDataURL('image/jpeg', 0.95);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// 8. 4 суретті түсіру процесі
async function startPhotoSequence() {
  if (isCapturing) return;
  triggerUserInteraction();
  isCapturing = true;
  capturedPhotos = [];
  startCaptureBtn.disabled = true;
  downloadBtn.disabled = true;
  shareBtn.disabled = true;
  retakeBtn.disabled = true;
  setShareStatus('');

  // Нобайларды тазалау
  for (let i = 0; i < 4; i++) {
    const slot = document.getElementById(`thumb${i}`);
    if (slot) {
      slot.innerHTML = `<span>${i + 1}</span>`;
      slot.classList.remove('captured');
    }
  }

  shotStatusBadge.classList.remove('hidden');

  const poses = [
    'Күлімсіреңіз! 😊',
    'Жүрек жасаңыз! 💖',
    'Көңілді поза! ✌️',
    'Соңғы сәт! ✨'
  ];

  for (let shotIndex = 0; shotIndex < 4; shotIndex++) {
    currentShotText.textContent = `${shotIndex + 1} / 4 сурет`;
    countdownTip.textContent = poses[shotIndex];

    countdownOverlay.classList.remove('hidden');
    for (let c = 3; c >= 1; c--) {
      countdownNumber.textContent = c;
      playBeep(c === 1 ? 880 : 440, 0.15);
      await sleep(1000);
    }
    countdownOverlay.classList.add('hidden');

    // Жарқыл және шертпе дыбысы
    flashEffect.classList.add('flash-active');
    playShutterSound();
    setTimeout(() => flashEffect.classList.remove('flash-active'), 400);

    // Кадр сақтау
    const photoData = captureFrame();
    capturedPhotos.push(photoData);

    const slot = document.getElementById(`thumb${shotIndex}`);
    if (slot) {
      slot.innerHTML = `<img src="${photoData}" alt="Shot ${shotIndex + 1}">`;
      slot.classList.add('captured');
    }

    if (shotIndex < 3) {
      currentShotText.textContent = 'Келесі позаға дайындалыңыз... ✨';
      await sleep(1500);
    }
  }

  shotStatusBadge.classList.add('hidden');
  isCapturing = false;
  startCaptureBtn.disabled = false;
  retakeBtn.disabled = false;

  // Нәтижені шығару
  renderPhotostrip();
}

if (startCaptureBtn) {
  startCaptureBtn.addEventListener('click', async () => {
    if (!currentStream || !currentStream.active) {
      const cameraStarted = await startCamera();
      if (!cameraStarted) return;
    }
    await startPhotoSequence();
  });
}

// 9. Фотолентаны Canvas-қа салу (2/2 тор немесе 1x4 лента)
async function renderPhotostrip() {
  if (capturedPhotos.length < 4) return;

  const canvas = photostripCanvas;
  const ctx = canvas.getContext('2d');

  const isDarkFrame = currentFrameColor === '#18181b';
  const textColor = isDarkFrame ? '#ffffff' : '#2b2d42';
  const subTextColor = isDarkFrame ? '#e2e8f0' : '#718096';
  const heartColor = '#ff4d6d';
  const captionText = customStripCaption.value.trim() || '11 «А» сынып ❤️';

  const today = new Date();
  const dateFormatted = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;

  if (currentLayout === '2x2') {
    // 2/2 ТОР (КВАДРАТ 2x2 КОЛЛАЖ)
    const canvasW = 1200;
    const canvasH = 1420;
    canvas.width = canvasW;
    canvas.height = canvasH;

    ctx.fillStyle = currentFrameColor;
    ctx.fillRect(0, 0, canvasW, canvasH);

    const marginX = 50;
    const startY = 55;
    const gapX = 30;
    const gapY = 30;
    const photoW = (canvasW - (marginX * 2) - gapX) / 2; // 535px
    const photoH = 405;

    for (let i = 0; i < 4; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const posX = marginX + col * (photoW + gapX);
      const posY = startY + row * (photoH + gapY);

      const img = await loadImage(capturedPhotos[i]);

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.14)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 5;
      ctx.fillStyle = '#000000';
      ctx.fillRect(posX, posY, photoW, photoH);
      ctx.restore();

      drawImageProp(ctx, img, posX, posY, photoW, photoH);

      drawPhotoStickers(ctx, posX, posY, photoW, photoH, i);

      ctx.strokeStyle = isDarkFrame ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)';
      ctx.lineWidth = 3;
      ctx.strokeRect(posX, posY, photoW, photoH);
    }

    const footerY = startY + (2 * photoH) + gapY + 45;
    ctx.textAlign = 'center';

    // Сәндік жүректер
    ctx.fillStyle = heartColor;
    ctx.font = '28px Arial, sans-serif';
    ctx.fillText('✦   ❤️   ✦', canvasW / 2, footerY);

    // 11 «А» сынып
    ctx.font = 'bold 50px "Montserrat", sans-serif';
    ctx.fillStyle = textColor;
    ctx.fillText(captionText, canvasW / 2, footerY + 65);

    // Ұран
    ctx.font = 'italic 600 24px "Playfair Display", Georgia, serif';
    ctx.fillStyle = subTextColor;
    ctx.fillText('МӘҢГІ БІРГЕ • БАҚЫТТЫ СӘТТЕР', canvasW / 2, footerY + 115);

    // Күні
    ctx.font = '500 20px "Montserrat", sans-serif';
    ctx.fillStyle = subTextColor;
    ctx.fillText(`Естелік күні: ${dateFormatted} ✦ PHOTOBOOTH 2/2`, canvasW / 2, footerY + 160);

    // Штрихкод
    drawAestheticBarcode(ctx, canvasW / 2, footerY + 185, isDarkFrame);

    // QURMASH белгісі
    ctx.font = 'bold 24px "Montserrat", sans-serif';
    ctx.fillStyle = heartColor;
    ctx.fillText('❤️ QURMASH ❤️', canvasW / 2, footerY + 235);

  } else {
    // 1x4 ВЕРТИКАЛЬ ЛЕНТА
    const stripWidth = 600;
    const stripHeight = 2000;
    canvas.width = stripWidth;
    canvas.height = stripHeight;

    ctx.fillStyle = currentFrameColor;
    ctx.fillRect(0, 0, stripWidth, stripHeight);

    const photoMarginX = 40;
    const photoW = stripWidth - (photoMarginX * 2);
    const photoH = 390;
    const startY = 45;
    const gapY = 24;

    for (let i = 0; i < 4; i++) {
      const img = await loadImage(capturedPhotos[i]);
      const currentY = startY + i * (photoH + gapY);

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = '#000000';
      ctx.fillRect(photoMarginX, currentY, photoW, photoH);
      ctx.restore();

      drawImageProp(ctx, img, photoMarginX, currentY, photoW, photoH);

      drawPhotoStickers(ctx, photoMarginX, currentY, photoW, photoH, i);

      ctx.strokeStyle = isDarkFrame ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
      ctx.lineWidth = 2;
      ctx.strokeRect(photoMarginX, currentY, photoW, photoH);
    }

    const footerStartY = startY + 4 * (photoH + gapY) + 20;
    ctx.textAlign = 'center';

    ctx.fillStyle = heartColor;
    ctx.font = '22px Arial, sans-serif';
    ctx.fillText('✦   ❤️   ✦', stripWidth / 2, footerStartY + 10);

    ctx.font = 'bold 38px "Montserrat", sans-serif';
    ctx.fillStyle = textColor;
    ctx.fillText(captionText, stripWidth / 2, footerStartY + 60);

    ctx.font = 'italic 600 20px "Playfair Display", Georgia, serif';
    ctx.fillStyle = subTextColor;
    ctx.fillText('МӘҢГІ БІРГЕ • БАҚЫТТЫ СӘТТЕР', stripWidth / 2, footerStartY + 100);

    ctx.font = '500 16px "Montserrat", sans-serif';
    ctx.fillStyle = subTextColor;
    ctx.fillText(`Естелік күні: ${dateFormatted} ✦ PHOTOBOOTH`, stripWidth / 2, footerStartY + 135);

    drawAestheticBarcode(ctx, stripWidth / 2, footerStartY + 155, isDarkFrame);

    ctx.font = 'bold 18px "Montserrat", sans-serif';
    ctx.fillStyle = heartColor;
    ctx.fillText('❤️ QURMASH ❤️', stripWidth / 2, footerStartY + 195);
  }

  emptyStripPlaceholder.classList.add('hidden');
  photostripCanvas.style.display = 'block';
  downloadBtn.disabled = false;
  shareBtn.disabled = false;
  retakeBtn.disabled = false;
}

// Әр суреттің бұрыштарына шағын стикерлер салу
function drawPhotoStickers(ctx, x, y, w, h, photoIndex) {
  if (selectedStickers.length === 0) return;

  const size = Math.max(28, Math.min(50, w * 0.085));
  const inset = Math.max(12, size * 0.3);
  const placements = [
    { x: x + inset, y: y + inset, align: 'left', baseline: 'top', rotation: -0.12 },
    { x: x + w - inset, y: y + h - inset, align: 'right', baseline: 'bottom', rotation: 0.12 }
  ];

  placements.forEach((spot, spotIndex) => {
    const sticker = selectedStickers[(photoIndex + spotIndex) % selectedStickers.length];
    ctx.save();
    ctx.translate(spot.x, spot.y);
    ctx.rotate(spot.rotation);
    ctx.font = `${size}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
    ctx.textAlign = spot.align;
    ctx.textBaseline = spot.baseline;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 7;
    ctx.shadowOffsetY = 2;
    ctx.fillText(sticker, 0, 0);
    ctx.restore();
  });
}

// Штрихкод салу
function drawAestheticBarcode(ctx, centerX, y, isDark) {
  ctx.save();
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)';
  const barWidths = [2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 2, 1, 2, 3, 1];
  const totalW = barWidths.reduce((a, b) => a + b * 4, 0);
  let currentX = centerX - totalW / 2;

  for (let w of barWidths) {
    ctx.fillRect(currentX, y, w * 2.5, 18);
    currentX += (w * 2.5) + 3;
  }
  ctx.restore();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(img);
    img.src = src;
  });
}

function drawImageProp(ctx, img, x, y, w, h) {
  const imgW = img.width || 640;
  const imgH = img.height || 480;
  const r = Math.min(w / imgW, h / imgH);
  let nw = imgW * r;
  let nh = imgH * r;
  let cx, cy, cw, ch, ar = 1;

  if (nw < w) ar = w / nw;
  if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;
  nw *= ar;
  nh *= ar;

  cw = imgW / (nw / w);
  ch = imgH / (nh / h);
  cx = (imgW - cw) * 0.5;
  cy = (imgH - ch) * 0.5;

  ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}

function getPhotostripFilename() {
  const timestamp = new Date().toISOString().slice(0, 10);
  return `11A_synyp_fotobudka_${timestamp}.png`;
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('PNG файлын дайындау мүмкін болмады.'));
    }, 'image/png', 1.0);
  });
}

function setShareStatus(message, type = '') {
  if (!shareStatus) return;
  shareStatus.textContent = message;
  shareStatus.className = `share-status${type ? ` ${type}` : ''}`;
}

function downloadPhotostrip() {
  if (capturedPhotos.length < 4) return;
  const dataURL = photostripCanvas.toDataURL('image/png', 1.0);
  const a = document.createElement('a');
  a.download = getPhotostripFilename();
  a.href = dataURL;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// 10. AirDrop немесе телефонның/компьютердің стандартты Share мәзірі
if (shareBtn) {
  shareBtn.addEventListener('click', async () => {
    if (capturedPhotos.length < 4) return;

    shareBtn.disabled = true;
    setShareStatus('Фотолента дайындалып жатыр…');

    try {
      const blob = await canvasToBlob(photostripCanvas);
      const file = new File([blob], getPhotostripFilename(), { type: 'image/png' });
      const shareData = {
        title: '11 «А» сынып фотолентасы',
        text: 'Бақытты сәттеріміз 💖',
        files: [file]
      };

      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share(shareData);
        setShareStatus('Фотолента бөлісуге жіберілді ✓', 'success');
      } else {
        downloadPhotostrip();
        setShareStatus('Бұл браузерде бөлісу мәзірі жоқ. Фото файлға сақталды.', 'notice');
      }
    } catch (error) {
      if (error && error.name === 'AbortError') {
        setShareStatus('Бөлісу тоқтатылды.');
      } else {
        console.error('Share error:', error);
        downloadPhotostrip();
        setShareStatus('Бөлісу ашылмады. Фото файлға сақталды.', 'notice');
      }
    } finally {
      shareBtn.disabled = false;
    }
  });
}

// 11. Файлға сақтау (Download PNG)
if (downloadBtn) {
  downloadBtn.addEventListener('click', () => {
    downloadPhotostrip();
  });
}

// 12. Қайта түсіру
if (retakeBtn) {
  retakeBtn.addEventListener('click', () => {
    capturedPhotos = [];
    photostripCanvas.style.display = 'none';
    emptyStripPlaceholder.classList.remove('hidden');
    downloadBtn.disabled = true;
    shareBtn.disabled = true;
    retakeBtn.disabled = true;
    setShareStatus('');

    for (let i = 0; i < 4; i++) {
      const slot = document.getElementById(`thumb${i}`);
      if (slot) {
        slot.innerHTML = `<span>${i + 1}</span>`;
        slot.classList.remove('captured');
      }
    }

    startPhotoSequence();
  });
}

// 13. Галереядан 4 сурет жүктеу
if (fileInputUpload) {
  fileInputUpload.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    capturedPhotos = [];
    for (let i = 0; i < Math.min(files.length, 4); i++) {
      const reader = new FileReader();
      const photoData = await new Promise(res => {
        reader.onload = ev => res(ev.target.result);
        reader.readAsDataURL(files[i]);
      });
      capturedPhotos.push(photoData);

      const slot = document.getElementById(`thumb${i}`);
      if (slot) {
        slot.innerHTML = `<img src="${photoData}" alt="Upload ${i + 1}">`;
        slot.classList.add('captured');
      }
    }

    if (capturedPhotos.length === 4) {
      renderPhotostrip();
    } else {
      alert(`Сіз ${capturedPhotos.length} сурет таңдадыңыз. Толық лента үшін 4 сурет қажет!`);
    }
  });
}

// Бет жүктелгенде
window.addEventListener('DOMContentLoaded', () => {
  createFloatingHearts();
  showCameraError(
    'Камераны қосыңыз',
    '«Камераны қосу» батырмасын басып, браузер сұрағанда рұқсат беріңіз.'
  );
});
