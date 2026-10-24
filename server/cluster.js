import cluster from 'node:cluster'
import os from 'node:os'

// Clustering allows Node.js to use all available CPU cores on the server
// The primary process forks child worker processes to distribute incoming HTTP requests
if (cluster.isPrimary) {
  let cpuCount = os.cpus().length
  console.log(`Primary cluster process running on PID ${process.pid}`)
  console.log(`Forking ${cpuCount} worker processes across CPU cores...`)

  // Spawn one worker process per CPU core
  for (let i = 0; i < cpuCount; i++) {
    cluster.fork()
  }

  // If any worker process unexpectedly dies, automatically spawn a new one
  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died. Starting a replacement worker...`)
    cluster.fork()
  })
} else {
  // Worker processes share the same HTTP server port
  import('./server.js')
}
