const mineflayer = require('mineflayer');

let bot = null;
let antiAFKInterval = null;

// Server config - UPDATED PORT TO 10534
const config = {
  host: 'aglaea.mcserverhost.com',
  port: 10534,  // ← PORT FROM YOUR server.properties
  username: 'KeepAliveBot',
  version: '1.21',  // Match your server version
  auth: 'offline'   // For cracked/offline server
};

console.log('===========================================');
console.log('🤖 MINECRAFT KEEP-ALIVE BOT');
console.log('📍 Target:', config.host + ':' + config.port);
console.log('👤 Bot name:', config.username);
console.log('⏰ Session: ~5 hours (GitHub Actions)');
console.log('===========================================');

function connectBot() {
  console.log('🔗 Connecting to server...');
  
  bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    version: config.version,
    auth: config.auth,
    checkTimeoutInterval: 60 * 1000,
    connectTimeout: 30 * 1000,
    keepAlive: true
  });

  bot.on('login', () => {
    console.log('✅ Bot logged in successfully!');
  });

  bot.on('spawn', () => {
    console.log('🎉 Bot spawned in world!');
    console.log('🤖 Starting anti-AFK system...');
    startAntiAFK();
  });

  bot.on('end', (reason) => {
    console.log('🔌 Disconnected:', reason);
    stopAntiAFK();
    
    // Reconnect logic with increasing delays
    let delay = 15000; // 15 seconds
    
    if (reason.includes('ECONNREFUSED')) {
      console.log('💤 Server port closed - might be offline/sleeping');
      delay = 45000; // 45 seconds
    } else if (reason.includes('timeout')) {
      console.log('⏰ Connection timeout');
      delay = 30000; // 30 seconds
    }
    
    // Increase delay with each attempt (max 2 minutes)
    const attemptDelay = Math.min(120000, delay);
    console.log(`🔄 Reconnecting in ${attemptDelay/1000} seconds...`);
    setTimeout(connectBot, attemptDelay);
  });

  bot.on('error', (err) => {
    console.log('❌ Connection error:', err.message);
  });

  bot.on('kicked', (reason) => {
    console.log('🚫 Bot was kicked:', reason);
  });

  // Optional: Chat monitoring
  bot.on('message', (message) => {
    const text = message.toString();
    if (text.includes(config.username)) {
      console.log(`💬 Mention in chat: ${text}`);
    }
  });
}

function startAntiAFK() {
  console.log('🤖 Anti-AFK activated (moves every 30-90s)');
  
  if (antiAFKInterval) {
    clearInterval(antiAFKInterval);
  }
  
  antiAFKInterval = setInterval(() => {
    if (!bot || !bot.entity) return;
    
    try {
      // Random anti-AFK actions
      const actions = [
        () => {
          // Jump
          bot.setControlState('jump', true);
          setTimeout(() => bot.setControlState('jump', false), 300);
          console.log('🤖 Anti-AFK: Jumped');
        },
        () => {
          // Look around
          const yaw = Math.random() * Math.PI * 2;
          bot.look(yaw, 0, false);
          console.log('🤖 Anti-AFK: Looked around');
        },
        () => {
          // Small movement
          bot.setControlState('forward', true);
          setTimeout(() => {
            bot.setControlState('forward', false);
            console.log('🤖 Anti-AFK: Moved forward');
          }, 400);
        },
        () => {
          // Sneak briefly
          bot.setControlState('sneak', true);
          setTimeout(() => bot.setControlState('sneak', false), 500);
          console.log('🤖 Anti-AFK: Sneaked');
        }
      ];
      
      const action = actions[Math.floor(Math.random() * actions.length)];
      action();
      
    } catch (error) {
      console.log('🤖 Anti-AFK error:', error.message);
    }
  }, 30000 + Math.random() * 60000); // Every 30-90 seconds
}

function stopAntiAFK() {
  if (antiAFKInterval) {
    clearInterval(antiAFKInterval);
    antiAFKInterval = null;
    console.log('🤖 Anti-AFK stopped');
  }
}

// Graceful shutdown for GitHub Actions
process.on('SIGTERM', () => {
  console.log('⚠️  GitHub timeout approaching. Shutting down...');
  stopAntiAFK();
  if (bot) {
    bot.end('GitHub Actions restart');
  }
  setTimeout(() => {
    console.log('✅ Ready for next session');
    process.exit(0);
  }, 3000);
});

// GitHub Actions timeout warning (after 4h 50m)
setTimeout(() => {
  console.log('⚠️  GitHub timeout in 5 minutes. Preparing for restart...');
}, 290 * 60 * 1000); // 4 hours 50 minutes

// Start the bot
connectBot();
