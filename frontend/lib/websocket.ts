import { io, Socket } from "socket.io-client";

export class WebSocketManager {
  private socket: Socket;
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  constructor(private url: string) {
    // Initialize Socket.IO client but do not auto-connect
    this.socket = io(this.url, { 
      autoConnect: false,
      transports: ['websocket', 'polling']
    });
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket.connected) {
        resolve();
        return;
      }

      // Handle successful connection
      this.socket.once("connect", () => {
        console.log("Socket.IO connected");
        resolve();
      });

      // Handle connection errors
      this.socket.once("connect_error", (err) => {
        console.error("Socket.IO connection error:", err);
        reject(err);
      });

      // Open the connection
      this.socket.open();
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
