const mineflayer = require('mineflayer');

let bot = null;
let antiAFKInterval = null;

// Server config - USE YOUR INFO
const config = {
  host: 'aglaea.mcserverhost.com',
  port: 25565,
  username: 'KeepAliveBot',
  version: '1.21',
  auth: 'offline'
};

console.log('===========================================');
console.log('🤖 MINECRAFT KEEP-ALIVE BOT');
console.log('📍 Target:', config.host + ':' + config.port);
console.log('👤 Bot name:', config.username);
console.log('⏰ Session: 4h 55m (GitHub Actions)');
console.log('===========================================');

function connectBot() {
  console.log('🔗 Connecting to server...');
  
  bot = mineflayer.createBot(config);
  
  bot.on('login', () => {
    console.log('✅ Logged in! Server is active.');
  });
  
  bot.on('spawn', () => {
    console.log('🎉 Spawned in world!');
    console.log('🤖 Starting anti-AFK system...');
    startAntiAFK();
  });
  
  bot.on('end', (reason) => {
    console.log('🔌 Disconnected:', reason);
    stopAntiAFK();
    
    // Quick reconnect
    let delay = 10000; // 10 seconds
    
    if (reason.includes('ECONNREFUSED')) {
      console.log('💤 Server might be offline/sleeping');
      delay = 30000; // 30 seconds
    }
    
    console.log(`🔄 Reconnecting in ${delay/1000}s...`);
    setTimeout(connectBot, delay);
  });
  
  bot.on('error', (err) => {
    console.log('❌ Error:', err.message);
  });
  
  bot.on('kicked', (reason) => {
    console.log('🚫 Kicked:', reason);
  });
}

function startAntiAFK() {
  if (antiAFKInterval) clearInterval(antiAFKInterval);
  
  antiAFKInterval = setInterval(() => {
    if (!bot || !bot.entity) return;
    
    // Simple anti-AFK: jump randomly
    if (Math.random() > 0.5) {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 300);
      console.log('🤖 Anti-AFK: Jumped');
    }
    
    // Sometimes look around
    if (Math.random() > 0.7) {
      bot.look(Math.random() * Math.PI * 2, 0, false);
      console.log('🤖 Anti-AFK: Looked around');
    }
  }, 45000 + Math.random() * 30000); // Every 45-75 seconds
}

function stopAntiAFK() {
  if (antiAFKInterval) {
    clearInterval(antiAFKInterval);
    antiAFKInterval = null;
  }
}

// Start bot
connectBot();

// GitHub Actions timeout warning (after 4h 50m)
setTimeout(() => {
  console.log('⚠️  GitHub timeout in 5 minutes. Preparing restart...');
  console.log('🔄 Next session will start automatically');
}, 290 * 60 * 1000); // 4 hours 50 minutes
