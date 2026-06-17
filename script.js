document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('meme-canvas');
    const ctx = canvas.getContext('2d');
    
    const elements = {
        textInput: document.getElementById('text-input'),
        fontSize: document.getElementById('font-size'),
        fontSizeVal: document.getElementById('font-size-val'),
        lineHeight: document.getElementById('line-height'),
        lineHeightVal: document.getElementById('line-height-val'),
        paddingX: document.getElementById('padding-x'),
        paddingXVal: document.getElementById('padding-x-val'),
        textColor: document.getElementById('text-color'),
        downloadBtn: document.getElementById('download-btn'),
        resetBtn: document.getElementById('reset-btn')
    };

    // Instagram Portrait optimal resolution (4:5 ratio)
    const BASE_WIDTH = 1080;
    const BASE_HEIGHT = 1350;
    const SCALE_FACTOR = 2; // 2x resolution is mathematically perfect for Instagram's 1080x1350 downsampling

    // Generate subtle noise pattern to trick Instagram compression and prevent color banding
    const noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = 150;
    noiseCanvas.height = 150;
    const noiseCtx = noiseCanvas.getContext('2d');
    const imgData = noiseCtx.createImageData(150, 150);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 8; // Very subtle grain
        data[i] = noise;
        data[i+1] = noise;
        data[i+2] = noise;
        data[i+3] = 255;
    }
    noiseCtx.putImageData(imgData, 0, 0);

    const CANVAS_WIDTH = BASE_WIDTH * SCALE_FACTOR;
    const CANVAS_HEIGHT = BASE_HEIGHT * SCALE_FACTOR;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Load custom font before initial draw if possible
    document.fonts.load('50px "Fira Code"').then(() => {
        drawMeme();
    });

    function drawMeme() {
        // 1. Get current values
        const fontSize = parseInt(elements.fontSize.value, 10);
        const lineHeightMult = parseFloat(elements.lineHeight.value);
        const paddingX = parseInt(elements.paddingX.value, 10);
        const textColor = elements.textColor.value;

        // 2. Update UI badges
        elements.fontSizeVal.textContent = fontSize;
        elements.lineHeightVal.textContent = lineHeightMult.toFixed(1);
        elements.paddingXVal.textContent = paddingX;

        // 3. Clear and Fill Canvas Background
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset scale
        ctx.fillStyle = '#0a0a0a'; // Off-black prevents severe compression ringing
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Apply noise overlay
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = ctx.createPattern(noiseCanvas, 'repeat');
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.globalCompositeOperation = 'source-over';

        // Apply high quality scale
        ctx.scale(SCALE_FACTOR, SCALE_FACTOR);

        // 4. Setup Text Styles
        // Using Fira Code (monospaced) for the aesthetic
        ctx.font = `${fontSize}px "Fira Code", "Courier New", Courier, monospace`;
        ctx.fillStyle = textColor;
        ctx.textBaseline = 'top';

        // 5. Process Text Content
        const text = elements.textInput.value;
        const lines = text.split('\n');
        
        // 6. Calculate dimensions for centering
        const lineHeightPixels = fontSize * lineHeightMult;
        const totalTextHeight = lines.length * lineHeightPixels;
        
        // Center vertically, with a slight offset towards top to look natural
        let startY = (BASE_HEIGHT - totalTextHeight) / 2;
        
        // Prevent going off-screen at the top if text is too long
        if (startY < 50) startY = 50;

        // 7. Draw each line
        lines.forEach((line, index) => {
            const y = startY + (index * lineHeightPixels);
            
            // Handle indentation preserving
            // In canvas, spaces might not render exactly like HTML depending on the font
            // But monospace fonts preserve space widths perfectly
            ctx.fillText(line, paddingX, y);
        });

        // 8. Draw watermark
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = textColor;
        ctx.font = '30px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('@devmoood', BASE_WIDTH / 2, BASE_HEIGHT - 60);
        
        // Reset properties for next draw
        ctx.globalAlpha = 1.0;
        ctx.textAlign = 'left';
    }

    // Attach Event Listeners to all inputs
    ['input', 'change'].forEach(evt => {
        elements.textInput.addEventListener(evt, drawMeme);
        elements.fontSize.addEventListener(evt, drawMeme);
        elements.lineHeight.addEventListener(evt, drawMeme);
        elements.paddingX.addEventListener(evt, drawMeme);
        elements.textColor.addEventListener(evt, drawMeme);
    });

    // Handle Download
    elements.downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        const timestamp = new Date().getTime();
        link.download = `instacode-${timestamp}.png`;
        // High quality PNG for Instagram
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        // Button animation feedback
        const btnText = elements.downloadBtn.innerHTML;
        elements.downloadBtn.innerHTML = 'Downloaded! ✓';
        elements.downloadBtn.style.background = '#10b981';
        
        setTimeout(() => {
            elements.downloadBtn.innerHTML = btnText;
            elements.downloadBtn.style.background = '';
        }, 2000);
    });

    // Handle Reset
    elements.resetBtn.addEventListener('click', () => {
        elements.fontSize.value = 55;
        elements.lineHeight.value = 1.5;
        elements.paddingX.value = 100;
        elements.textColor.value = '#f0f0f0';
        drawMeme();
    });

    // Initial draw
    drawMeme();
});
