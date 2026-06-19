const imageUpload = document.getElementById('imageUpload');
const fileNameDisplay = document.getElementById('fileName');
const taglineInput = document.getElementById('taglineInput');
const styleButtons = document.querySelectorAll('.style-btn');
const downloadBtn = document.getElementById('downloadBtn');
const canvas = document.getElementById('postcardCanvas');
const ctx = canvas.getContext('2d');
const previewPlaceholder = document.getElementById('previewPlaceholder');
const colorButtons = document.querySelectorAll('.color-btn');

let currentImage = null;
let currentStyle = 'gingham';
let currentColor = 'blue';
let tagline = '';

// Colors map
const colorMap = {
    blue: { primary: '#8cb1d1', overlap: '#6892b8' },
    green: { primary: '#91cca6', overlap: '#6eb387' },
    red: { primary: '#db8888', overlap: '#c26565' },
    yellow: { primary: '#e6d17e', overlap: '#cfb75f' }
};

// Load custom font to ensure it's available for canvas drawing
const loadFonts = async () => {
    const font1 = new FontFace('Playfair Display', 'url(https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtM.woff2)');
    const font2 = new FontFace('Outfit', 'url(https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NJtEtq.woff2)');
    const font3 = new FontFace('Caveat', 'url(https://fonts.gstatic.com/s/caveat/v18/Wnz6HAc5bAfYB2Q7ZjIW.woff2)');
    try {
        await font1.load();
        await font2.load();
        await font3.load();
        document.fonts.add(font1);
        document.fonts.add(font2);
        document.fonts.add(font3);
    } catch (e) {
        console.log("Fonts might not be fully loaded for canvas immediately.");
    }
};

loadFonts();

// Handle Image Upload
imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        fileNameDisplay.textContent = file.name;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                currentImage = img;
                previewPlaceholder.style.display = 'none';
                canvas.style.display = 'block';
                downloadBtn.disabled = false;
                drawPostcard();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Handle Tagline Input
taglineInput.addEventListener('input', (e) => {
    tagline = e.target.value;
    if (currentImage) {
        drawPostcard();
    }
});

// Handle Style Selection
styleButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        styleButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentStyle = e.target.dataset.style;
        
        // Show/hide color selector based on style
        const colorSelectorGroup = document.getElementById('colorSelectorGroup');
        if(colorSelectorGroup) {
            colorSelectorGroup.style.display = currentStyle === 'gingham' ? 'block' : 'none';
        }

        if (currentImage) {
            drawPostcard();
        }
    });
});

// Handle Color Selection
colorButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        colorButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentColor = e.target.dataset.color;
        if (currentImage && currentStyle === 'gingham') {
            drawPostcard();
        }
    });
});

// Init visibility
const colorSelectorGroup = document.getElementById('colorSelectorGroup');
if(colorSelectorGroup) {
    colorSelectorGroup.style.display = currentStyle === 'gingham' ? 'block' : 'none';
}

// Main Draw Function
function drawPostcard() {
    if (!currentImage) return;

    // Define output resolution (high res for download)
    const targetWidth = 1200;
    let targetHeight = 0;

    // Calculate aspect ratio and target height based on style
    if (currentStyle === 'polaroid') {
        // Polaroid is usually a specific aspect ratio, e.g. 4:5
        targetHeight = targetWidth * (5/4);
    } else if (currentStyle === 'classic') {
        // Classic postcard 6:4
        targetHeight = targetWidth * (4/6);
    } else {
        // Modern - adaptive to image but with padding
        targetHeight = targetWidth * (currentImage.height / currentImage.width) + 300; 
        if(targetHeight < targetWidth) targetHeight = targetWidth; // Make sure there's room
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentStyle === 'modern') {
        drawModernStyle(targetWidth, targetHeight);
    } else if (currentStyle === 'polaroid') {
        drawPolaroidStyle(targetWidth, targetHeight);
    } else if (currentStyle === 'gingham') {
        drawGinghamStyle(targetWidth, targetHeight);
    } else {
        drawClassicStyle(targetWidth, targetHeight);
    }
}

function drawGinghamStyle(w, h) {
    const theme = colorMap[currentColor];
    
    // Background Off-white
    ctx.fillStyle = '#f6f4eb';
    ctx.fillRect(0, 0, w, h);

    // Gingham Pattern - overlapping translucent squares
    const squareSize = 80;
    
    ctx.fillStyle = theme.primary;
    // We use a slight opacity so intersecting lines become darker naturally
    ctx.globalAlpha = 0.6;
    
    // Horizontal stripes
    for (let y = 0; y < h; y += squareSize * 2) {
        ctx.fillRect(0, y, w, squareSize);
    }
    
    // Vertical stripes
    for (let x = 0; x < w; x += squareSize * 2) {
        ctx.fillRect(x, 0, squareSize, h);
    }
    ctx.globalAlpha = 1.0;
    
    // Center Frame
    const frameW = w * 0.75;
    const frameH = h * 0.7;
    const frameX = (w - frameW) / 2;
    const frameY = (h - frameH) / 2 - 50;
    
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = '#ffffff';
    
    // Scalloped edges
    const scallopRadius = 8;
    const spacing = 30;
    
    ctx.beginPath();
    ctx.rect(frameX, frameY, frameW, frameH);
    // Draw circles along edges to create scallop
    for (let x = frameX; x <= frameX + frameW; x += spacing) {
        ctx.moveTo(x, frameY);
        ctx.arc(x, frameY, scallopRadius, 0, Math.PI * 2);
    }
    for (let y = frameY; y <= frameY + frameH; y += spacing) {
        ctx.moveTo(frameX + frameW, y);
        ctx.arc(frameX + frameW, y, scallopRadius, 0, Math.PI * 2);
    }
    for (let x = frameX + frameW; x >= frameX; x -= spacing) {
        ctx.moveTo(x, frameY + frameH);
        ctx.arc(x, frameY + frameH, scallopRadius, 0, Math.PI * 2);
    }
    for (let y = frameY + frameH; y >= frameY; y -= spacing) {
        ctx.moveTo(frameX, y);
        ctx.arc(frameX, y, scallopRadius, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.restore();
    
    // Draw the image inside the frame
    const imgMargin = 30;
    const imgAreaX = frameX + imgMargin;
    const imgAreaY = frameY + imgMargin;
    const imgAreaW = frameW - imgMargin * 2;
    const imgAreaH = frameH - imgMargin * 2;
    
    const scale = Math.max(imgAreaW / currentImage.width, imgAreaH / currentImage.height);
    const drawW = currentImage.width * scale;
    const drawH = currentImage.height * scale;
    
    ctx.save();
    ctx.beginPath();
    ctx.rect(imgAreaX, imgAreaY, imgAreaW, imgAreaH);
    ctx.clip();
    ctx.drawImage(currentImage, imgAreaX + (imgAreaW - drawW)/2, imgAreaY + (imgAreaH - drawH)/2, drawW, drawH);
    ctx.restore();
    
    // Paperclip (top right)
    drawPaperclip(ctx, frameX + frameW - 20, frameY - 20, Math.PI/4);
    
    // Torn Paper Notebook Banner
    const bannerW = w * 0.85;
    const bannerH = 180;
    const bannerX = (w - bannerW) / 2;
    const bannerY = frameY + frameH - 60;
    
    ctx.save();
    // Rotate slightly
    ctx.translate(w/2, bannerY + bannerH/2);
    ctx.rotate(-0.02);
    ctx.translate(-w/2, -(bannerY + bannerH/2));
    
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = '#fdfbf7'; // notebook paper color
    
    // Draw jagged banner path
    ctx.beginPath();
    ctx.moveTo(bannerX, bannerY);
    ctx.lineTo(bannerX + bannerW, bannerY);
    
    const jaggedCount = 60;
    const jaggedWidth = bannerW / jaggedCount;
    for (let i = 1; i <= jaggedCount; i++) {
        const x = bannerX + bannerW - (i * jaggedWidth);
        const y = bannerY + bannerH + (Math.random() * 15 - 5);
        ctx.lineTo(x, y);
    }
    ctx.lineTo(bannerX, bannerY);
    ctx.fill();
    ctx.restore();
    
    // Draw Notebook holes
    ctx.save();
    ctx.translate(w/2, bannerY + bannerH/2);
    ctx.rotate(-0.02);
    ctx.translate(-w/2, -(bannerY + bannerH/2));
    
    ctx.fillStyle = '#cbd5e1'; 
    const holeRadius = 12;
    const holeCount = 10;
    const holeSpacing = bannerW / (holeCount + 1);
    for (let i = 1; i <= holeCount; i++) {
        const hX = bannerX + (i * holeSpacing);
        const hY = bannerY + 15;
        
        ctx.beginPath();
        ctx.arc(hX, hY, holeRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner shadow effect
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.beginPath();
        ctx.arc(hX, hY, holeRadius, 0, Math.PI, true);
        ctx.fill();
        ctx.fillStyle = '#cbd5e1';
    }
    
    // Text
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.font = '70px "Caveat", cursive'; 
    const textToDraw = tagline || "Happy Father's Day";
    wrapText(ctx, textToDraw, w/2, bannerY + bannerH/2 + 25, bannerW - 100, 60);
    
    ctx.restore();
}

function drawPaperclip(ctx, x, y, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 4;
    
    ctx.beginPath();
    ctx.moveTo(12, 20);
    ctx.lineTo(12, 70);
    ctx.arc(22, 70, 10, Math.PI, 0, false); 
    ctx.lineTo(32, -10);
    ctx.arc(16, -10, 16, 0, Math.PI, true);
    ctx.lineTo(0, 80);
    ctx.arc(22, 80, 22, Math.PI, 0, false);
    ctx.lineTo(44, 15);
    ctx.stroke();
    
    // Add a slight highlight to make it look metallic
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'transparent';
    ctx.stroke();
    
    ctx.restore();
}

function drawModernStyle(w, h) {
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#1e3a8a'); // Deep blue
    gradient.addColorStop(1, '#3b82f6'); // Lighter blue
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Add some graphic elements
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.arc(0, 0, w * 0.4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(w, h, w * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Draw Image
    const margin = 80;
    const imgMaxW = w - (margin * 2);
    const imgMaxH = h - 350; // Leave space for text
    
    const scale = Math.min(imgMaxW / currentImage.width, imgMaxH / currentImage.height);
    const imgW = currentImage.width * scale;
    const imgH = currentImage.height * scale;
    
    const imgX = (w - imgW) / 2;
    const imgY = margin;

    // Image shadow
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 15;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(imgX - 10, imgY - 10, imgW + 20, imgH + 20); // Border
    ctx.shadowColor = 'transparent';

    ctx.drawImage(currentImage, imgX, imgY, imgW, imgH);

    // Draw Text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    
    // Title
    ctx.font = 'bold 80px "Playfair Display", serif';
    ctx.fillText("Happy Father's Day", w / 2, imgY + imgH + 120);

    // Tagline
    if (tagline) {
        ctx.font = '300 40px "Outfit", sans-serif';
        wrapText(ctx, tagline, w / 2, imgY + imgH + 190, w - 160, 50);
    }
}

function drawPolaroidStyle(w, h) {
    // Background
    ctx.fillStyle = '#e2e8f0'; // Light gray table background
    ctx.fillRect(0, 0, w, h);

    // Polaroid card
    const pMarginX = 100;
    const pMarginTop = 100;
    const pMarginBottom = 150;
    const pW = w - (pMarginX * 2);
    const pH = h - pMarginTop - pMarginBottom;

    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 20;
    ctx.fillStyle = '#ffffff';
    
    // Rotate slightly for effect
    ctx.save();
    ctx.translate(w/2, h/2);
    ctx.rotate(0.02); // Small rotation
    ctx.translate(-w/2, -h/2);

    ctx.fillRect(pMarginX, pMarginTop, pW, pH);
    ctx.shadowColor = 'transparent';

    // Draw Image inside polaroid
    const innerMargin = 40;
    const imgAreaW = pW - (innerMargin * 2);
    const imgAreaH = pW - (innerMargin * 2); // Square-ish
    
    // Crop image to fit area (cover)
    const scale = Math.max(imgAreaW / currentImage.width, imgAreaH / currentImage.height);
    const drawW = currentImage.width * scale;
    const drawH = currentImage.height * scale;
    const drawX = pMarginX + innerMargin + (imgAreaW - drawW) / 2;
    const drawY = pMarginTop + innerMargin + (imgAreaH - drawH) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.rect(pMarginX + innerMargin, pMarginTop + innerMargin, imgAreaW, imgAreaH);
    ctx.clip();
    ctx.drawImage(currentImage, drawX, drawY, drawW, drawH);
    ctx.restore();

    // Text area
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    
    // Father's Day text
    ctx.font = 'italic 50px "Playfair Display", serif';
    ctx.fillText("Happy Father's Day", w / 2, pMarginTop + innerMargin + imgAreaH + 90);

    // Hand-written style tagline
    if (tagline) {
        ctx.font = '400 40px "Outfit", sans-serif'; // Imagine a handwriting font here
        ctx.fillStyle = '#334155';
        wrapText(ctx, tagline, w / 2, pMarginTop + innerMargin + imgAreaH + 160, pW - 80, 45);
    }

    ctx.restore(); // Restore from rotation
}

function drawClassicStyle(w, h) {
    // Background texture/color
    ctx.fillStyle = '#fdfbf7'; // Warm off-white
    ctx.fillRect(0, 0, w, h);

    // Border
    ctx.strokeStyle = '#d4af37'; // Gold
    ctx.lineWidth = 10;
    ctx.strokeRect(30, 30, w - 60, h - 60);
    
    ctx.strokeStyle = '#1e3a8a'; // Navy
    ctx.lineWidth = 2;
    ctx.strokeRect(45, 45, w - 90, h - 90);

    // Split layout: Image left, text right
    const imgAreaW = (w / 2) - 80;
    const imgAreaH = h - 160;
    
    // Image on Left
    const scale = Math.max(imgAreaW / currentImage.width, imgAreaH / currentImage.height);
    const drawW = currentImage.width * scale;
    const drawH = currentImage.height * scale;
    
    ctx.save();
    ctx.beginPath();
    ctx.rect(80, 80, imgAreaW, imgAreaH);
    ctx.clip();
    // Center crop
    ctx.drawImage(currentImage, 80 + (imgAreaW - drawW)/2, 80 + (imgAreaH - drawH)/2, drawW, drawH);
    ctx.restore();

    // Text on Right
    const textCenterX = w * 0.75;
    
    ctx.fillStyle = '#1e3a8a';
    ctx.textAlign = 'center';
    
    ctx.font = 'bold 70px "Playfair Display", serif';
    ctx.fillText("HAPPY", textCenterX, h * 0.35);
    ctx.fillText("FATHER'S", textCenterX, h * 0.35 + 80);
    ctx.fillText("DAY", textCenterX, h * 0.35 + 160);

    // Decorative line
    ctx.beginPath();
    ctx.moveTo(textCenterX - 100, h * 0.35 + 220);
    ctx.lineTo(textCenterX + 100, h * 0.35 + 220);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    ctx.stroke();

    if (tagline) {
        ctx.fillStyle = '#475569';
        ctx.font = 'italic 35px "Playfair Display", serif';
        wrapText(ctx, tagline, textCenterX, h * 0.35 + 300, imgAreaW - 40, 45);
    }
}

// Utility: Wrap text function for canvas
function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';

    for(let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      }
      else {
        line = testLine;
      }
    }
    context.fillText(line, x, y);
}

// Handle Download
downloadBtn.addEventListener('click', () => {
    if (!currentImage) return;
    
    // Create a temporary link
    const link = document.createElement('a');
    link.download = 'Fathers-Day-Postcard.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});
