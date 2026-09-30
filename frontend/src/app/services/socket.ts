import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000');
  }

  joinChannel(channelId: string, username: string): void {
    this.socket.emit('joinChannel', {
      channelId,
      username
    });
  }

  leaveChannel(channelId: string, username: string): void {
    this.socket.emit('leaveChannel', {
      channelId,
      username
    });
  }

  sendMessage(
    channelId: string,
    username: string,
    message: string
  ): void {
    this.socket.emit('chatMessage', {
      channelId,
      username,
      message
    });
  }

  onMessage(callback: (message: any) => void): void {
    this.socket.on('chatMessage', callback);
  }

  onUserJoined(callback: (data: any) => void): void {
    this.socket.on('userJoined', callback);
  }

  onUserLeft(callback: (data: any) => void): void {
    this.socket.on('userLeft', callback);
  }

  removeListeners(): void {
    this.socket.off('chatMessage');
    this.socket.off('userJoined');
    this.socket.off('userLeft');
  }
}