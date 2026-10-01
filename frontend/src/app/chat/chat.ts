import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SocketService } from '../services/socket';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-chat',
  imports: [FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat implements OnInit, OnDestroy {

  channelId = '';
  channelName = '';

  username = '';
  profileImage = '';
  newMessage = '';

  selectedImage: File | null = null;
  uploading = false;

  messages: any[] = [];
  notifications: string[] = [];

  constructor(
    private socketService: SocketService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit(): void {

    // Get logged-in user
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.username = user.username;
      this.profileImage = user.profileImage || '';
    }

    // Get channel information from URL
    this.route.paramMap.subscribe(params => {

      this.channelId = params.get('channelId') || '';
      this.channelName = params.get('channelName') || 'Chat';

      if (this.channelId) {
        this.http.get<any[]>(
          `http://localhost:3000/api/messages/${this.channelId}`
        ).subscribe({
          next: (messages) => {
            this.messages = messages;
            this.cdr.detectChanges();
          },
          error: () => {
            console.error('Unable to load message history');
          }
        });

        this.socketService.joinChannel(
          this.channelId,
          this.username
        );
      }
    });

    // Receive chat messages
    this.socketService.onMessage((message) => {
      this.messages.push(message);
      this.cdr.detectChanges();
    });

    // Someone joined
    this.socketService.onUserJoined((data) => {
      this.notifications.push(data.message);
      this.cdr.detectChanges();
    });

    // Someone left
    this.socketService.onUserLeft((data) => {
      this.notifications.push(data.message);
      this.cdr.detectChanges();
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() && !this.selectedImage) {
      return;
    }

    // Normal text-only message
    if (!this.selectedImage) {
      this.socketService.sendMessage(
        this.channelId,
        this.username,
        this.newMessage.trim(),
        '',
        this.profileImage
      );

      this.newMessage = '';
      return;
    }

    // Message containing an image
    const formData = new FormData();
    formData.append('image', this.selectedImage);

    this.uploading = true;

    this.http.post<any>(
      'http://localhost:3000/api/uploads',
      formData
    ).subscribe({
      next: (response) => {

        this.socketService.sendMessage(
          this.channelId,
          this.username,
          this.newMessage.trim(),
          response.imageUrl,
          this.profileImage
        );

        this.newMessage = '';
        this.selectedImage = null;
        this.uploading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Image upload failed:', error);
        this.uploading = false;
        this.cdr.detectChanges();
      }
    });
  }
  
  selectImage(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedImage = input.files[0];
    }
  }
  
  ngOnDestroy(): void {
    if (this.channelId) {
      this.socketService.leaveChannel(
        this.channelId,
        this.username
      );
    }

    this.socketService.removeListeners();
  }
}