import { io, type Socket } from "socket.io-client"

let socket: Socket | null = null

export function getSocket(token: string): Socket {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL ?? "", {
      auth: { token },
      transports: ["websocket"],
      autoConnect: true,
    })
    return socket
  }

  socket.auth = { token }
  if (!socket.connected) {
    socket.connect()
  }

  return socket
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
