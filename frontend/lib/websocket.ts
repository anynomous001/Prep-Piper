import { io, Socket } from "socket.io-client";

export class WebSocketManager {
  private socket: Socket;
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  private retryCount: number = 0;
  private maxRetries: number = 3;
  private retryDelay: number = 1000;

  constructor(private url: string) {
    // Initialize Socket.IO client but do not auto-connect
    this.socket = io(this.url, { 
      autoConnect: false,
      transports: ['websocket', 'polling'],
      timeout: 20000, // Increased timeout
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      forceNew: true,
      multiplex: false
    });
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket.connected) {
        resolve();
        return;
      }

      let connectTimeout: NodeJS.Timeout;

      const handleConnect = () => {
        console.log("Socket.IO connected successfully");
        this.retryCount = 0;
        clearTimeout(connectTimeout);
        cleanup();
        resolve();
      };

      const handleError = (err: Error) => {
        console.error("Socket.IO connection error:", err);
        clearTimeout(connectTimeout);
        
        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          console.log(`Retrying connection (${this.retryCount}/${this.maxRetries})...`);
          
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, this.retryCount - 1), 5000);
          
          setTimeout(() => {
            cleanup();
            setupAndConnect();
          }, delay);
        } else {
          cleanup();
          reject(new Error("Failed to connect after multiple attempts"));
        }
      };

      const cleanup = () => {
        clearTimeout(connectTimeout);
        this.socket.off("connect", handleConnect);
        this.socket.off("connect_error", handleError);
        this.socket.off("disconnect");
      };

      const setupAndConnect = () => {
        cleanup(); // Clean up any existing listeners
        
        // Set up connection timeout
        connectTimeout = setTimeout(() => {
          handleError(new Error("Connection timeout"));
        }, 20000);

        this.socket.once("connect", handleConnect);
        this.socket.once("connect_error", handleError);
        
        // Handle unexpected disconnects
        this.socket.on("disconnect", (reason) => {
          console.log("Socket disconnected:", reason);
          if (reason === "io server disconnect") {
            // Server initiated disconnect, attempt reconnect
            this.socket.connect();
          }
        });

        this.socket.connect();
      };

      setupAndConnect();
    });
  }

  on(messageType: string, handler: (data: any) => void) {
    // Register handler locally
    this.messageHandlers.set(messageType, handler);
    // Bind Socket.IO listener
    this.socket.on(messageType, handler);
  }

  off(messageType: string) {
    // Remove local handler
    this.messageHandlers.delete(messageType);
    // Unbind Socket.IO listener
    this.socket.off(messageType);
  }

  send(message: { type: string; data: any }) {
    if (this.socket.connected) {
      this.socket.emit(message.type, message.data);
    } else {
      console.error("Socket.IO is not connected");
    }
  }

  disconnect() {
    this.socket.disconnect();
    this.messageHandlers.clear();
  }

  get isConnected(): boolean {
    return this.socket.connected;
  }
}
