const fs = require('fs');

// Leer el SVG
const svgContent = fs.readFileSync('./public/assets/simple-world-map.svg', 'utf8');

const countryCodes = ['cl', 'ar', 'mx', 'co', 'pe', 'br', 'us', 'ca', 'es', 'it', 'de'];

console.log('Coordenadas de países:\n');

countryCodes.forEach(code => {
  // Buscar el elemento por id
  const regex = new RegExp(`id="${code}"[^>]*>([\\s\\S]*?)</(g|path)>`, 'g');
  const match = regex.exec(svgContent);
  
  if (match) {
    // Extraer todos los paths dentro del elemento
    const pathRegex = /d="([^"]*)"/g;
    let pathMatch;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    let pointCount = 0;
    
    while ((pathMatch = pathRegex.exec(match[0])) !== null) {
      const d = pathMatch[1];
      // Extraer todos los números del path
      const numbers = d.match(/[\d.]+/g);
      if (numbers) {
        for (let j = 0; j < numbers.length; j += 2) {
          const x = parseFloat(numbers[j]);
          const y = parseFloat(numbers[j + 1]);
          if (!isNaN(x) && !isNaN(y)) {
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
            pointCount++;
          }
        }
      }
    }
    
    if (pointCount > 0) {
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      console.log(`${code}: { x: ${centerX.toFixed(1)}, y: ${centerY.toFixed(1)} }, // bbox: ${minX.toFixed(0)},${minY.toFixed(0)} - ${maxX.toFixed(0)},${maxY.toFixed(0)}`);
    }
  } else {
    console.log(`${code}: NOT FOUND`);
  }
});
