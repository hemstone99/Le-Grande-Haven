// Startup file for cPanel "Setup Node.js App" (Phusion Passenger).
// Passenger loads the startup file with require(), which cannot load an ES
// module that uses top-level await — so hand off to server.js via import().
import('./server.js').catch((err) => {
  console.error('[app] Failed to start server:', err)
  process.exit(1)
})
