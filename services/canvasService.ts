
import { Friend } from '../types.ts';

/**
 * Renders a premium, high-definition digital greeting card
 * combining the original high-res image and personalized sentiment.
 * Clean, minimal, and personal - no promotional watermarks.
 */
export const generateHighResCard = async (friend: Friend): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject('Canvas context failed');

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = friend.imageUrl;

    img.onload = async () => {
      // Evergreen target year
      const now = new Date();
      const targetYear = now.getMonth() >= 6 ? now.getFullYear() + 1 : now.getFullYear();

      // High-end vertical card size (1200x1800)
      const canvasWidth = 1200;
      const canvasHeight = 1800; 
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // 1. Draw Deep Navy Background
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // 2. Draw Main Image (Centered and Cropped)
      const imageSectionHeight = 900;
      const imgAspect = img.width / img.height;
      const targetAspect = canvasWidth / imageSectionHeight;
      let drawW, drawH, sx, sy;

      if (imgAspect > targetAspect) {
        drawH = imageSectionHeight;
        drawW = imageSectionHeight * imgAspect;
        sx = (drawW - canvasWidth) / 2;
        sy = 0;
      } else {
        drawW = canvasWidth;
        drawH = canvasWidth / imgAspect;
        sx = 0;
        sy = (drawH - imageSectionHeight) / 2;
      }
      
      ctx.drawImage(img, -sx, -sy, drawW, drawH);

      // 3. Apply Gradient Overlay for Text Legibility
      const gradient = ctx.createLinearGradient(0, 600, 0, imageSectionHeight + 50);
      gradient.addColorStop(0, 'rgba(2, 6, 23, 0)');
      gradient.addColorStop(1, '#020617');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 600, canvasWidth, imageSectionHeight - 550);

      // 4. Draw Festive Accents (Gold Border)
      ctx.strokeStyle = '#d97706'; // amber-600
      ctx.lineWidth = 6;
      ctx.strokeRect(50, 50, canvasWidth - 100, canvasHeight - 100);
      
      // 5. Load Fonts
      try {
        await Promise.all([
          document.fonts.load('bold 100px "Playfair Display"'),
          document.fonts.load('500 50px "Playfair Display"'),
          document.fonts.load('bold 80px "Playfair Display"'),
          document.fonts.load('italic 40px "Inter"')
        ]);
      } catch (e) {
        console.warn("Using system fonts fallback");
      }

      ctx.textAlign = 'center';

      // 6. Draw Target Year
      ctx.fillStyle = '#f59e0b'; // amber-500
      ctx.font = 'bold 110px "Playfair Display"';
      ctx.fillText(targetYear.toString(), canvasWidth / 2, 1030);
      
      // 7. Draw "HAPPY NEW YEAR"
      ctx.fillStyle = '#ffffff';
      ctx.font = '500 50px "Playfair Display"';
      ctx.fillText('HAPPY NEW YEAR', canvasWidth / 2, 1100);

      // 8. Draw Recipient's Name
      ctx.fillStyle = '#fde68a'; // amber-200
      ctx.font = 'bold 80px "Playfair Display"';
      ctx.fillText(friend.name, canvasWidth / 2, 1220);

      // 9. Draw Personalized Message with robust wrapping
      ctx.fillStyle = '#cbd5e1'; // slate-300
      ctx.font = 'italic 44px "Inter"';
      const words = friend.message.split(' ');
      let line = '';
      let y = 1320;
      const maxWidth = 960;
      const lineHeight = 70;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line, canvasWidth / 2, y);
          line = words[n] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, canvasWidth / 2, y);

      // Footer - Minimalistic separator
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(canvasWidth/2 - 100, 1650, 200, 2);

      resolve(canvas.toDataURL('image/png', 1.0));
    };

    img.onerror = () => reject('Image load failed');
  });
};
