const https = require('https');
const fs = require('fs');
const path = require('path');

const games = [
  {
    name: 'VRChat',
    filename: 'vrchat.png',
    steamAppId: '438100',
    steamUrl: 'https://store.steampowered.com/app/438100'
  },
  {
    name: 'Resonite',
    filename: 'resonite.png',
    steamAppId: '2519830',
    steamUrl: 'https://store.steampowered.com/app/2519830'
  },
  {
    name: 'ChilloutVR',
    filename: 'chillout-vr.png',
    steamAppId: '661130',
    steamUrl: 'https://store.steampowered.com/app/661130'
  },
  {
    name: 'Blade & Sorcery',
    filename: 'blade-and-sorcery.png',
    steamAppId: '629730',
    steamUrl: 'https://store.steampowered.com/app/629730'
  },
  {
    name: 'Dragon Fist: VR Kung Fu',
    filename: 'dragon-fist.png',
    steamAppId: '1481480',
    steamUrl: 'https://store.steampowered.com/app/1481480'
  },
  {
    name: 'Sairento VR',
    filename: 'sairento-vr.png',
    steamAppId: '555880',
    steamUrl: 'https://store.steampowered.com/app/555880'
  },
  {
    name: 'Dance Dash',
    filename: 'dance-dash.png',
    steamAppId: '667880',
    steamUrl: 'https://store.steampowered.com/app/667880'
  },
  {
    name: 'Holodance',
    filename: 'holodance.png',
    steamAppId: '422860',
    steamUrl: 'https://store.steampowered.com/app/422860'
  },
  {
    name: 'VRWorkout',
    filename: 'vrworkout.png',
    steamAppId: '1114260',
    steamUrl: 'https://store.steampowered.com/app/1114260'
  },
  {
    name: 'Final Soccer VR',
    filename: 'final-soccer-vr.png',
    steamAppId: '555740',
    steamUrl: 'https://store.steampowered.com/app/555740'
  },
  {
    name: 'Tornuffalo',
    filename: 'tornuffalo.png',
    steamAppId: '541960',
    steamUrl: 'https://store.steampowered.com/app/541960'
  },
  {
    name: 'VR Monster Awakens',
    filename: 'vr-monster-awakens.png',
    steamAppId: '545250',
    steamUrl: 'https://store.steampowered.com/app/545250'
  },
  {
    name: 'Climbey',
    filename: 'climbey.png',
    steamAppId: '520010',
    steamUrl: 'https://store.steampowered.com/app/520010'
  },
  {
    name: 'Island 359',
    filename: 'island-359.png',
    steamAppId: '476110',
    steamUrl: 'https://store.steampowered.com/app/476110'
  }
];

const outputDir = path.join(__dirname, '../public/assets/games');

// Crear directorio si no existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Guardar información de los juegos
const gamesData = {
  games: games.map(game => ({
    name: game.name,
    logo: `/assets/games/${game.filename}`,
    steamUrl: game.steamUrl,
    steamAppId: game.steamAppId
  }))
};

fs.writeFileSync(
  path.join(outputDir, 'games-data.json'),
  JSON.stringify(gamesData, null, 2)
);

console.log('✓ Archivo games-data.json creado');
console.log('\nAhora necesitas descargar manualmente los logos desde Steam o SteamGridDB');
console.log('Guárdalos en public/assets/games/ con los siguientes nombres:\n');
games.forEach(game => {
  console.log(`- ${game.filename} (${game.name}) - ${game.steamUrl}`);
});
