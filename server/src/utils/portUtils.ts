import net from 'net';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export async function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => resolve(true))
      .once('listening', () => {
        server.close();
        resolve(false);
      })
      .listen(port);
  });
}

export async function findAvailablePort(startPort: number): Promise<number> {
  let port = startPort;
  while (await isPortInUse(port)) {
    port++;
  }
  return port;
}

export async function killProcessOnPort(port: number): Promise<void> {
  try {
    const platform = process.platform;
    if (platform === 'win32') {
      await execAsync(`for /f "tokens=5" %a in ('netstat -aon ^| find ":${port}"') do taskkill /F /PID %a`);
    } else {
      await execAsync(`lsof -i :${port} | grep LISTEN | awk '{print $2}' | xargs -r kill -9`);
    }
  } catch (error) {
    console.error(`Failed to kill process on port ${port}:`, error);
  }
}
