import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SocketService } from '../services/socket';
import { HttpClient } from '@angular/common/http';
import {
  GroupService,
  Group,
  Channel
} from '../services/group';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-chat',
  imports: [FormsModule, RouterLink, DatePipe ],
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
  user: any = null;

  groups: Group[] = [];
  channels: Channel[] = [];
  selectedGroup: Group | null = null;

  showChannelForm = false;
  newChannelName = '';
  showGroupForm = false;
  newGroupName = '';
  
  constructor(
    private socketService: SocketService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private groupService: GroupService
  ) {}

  ngOnInit(): void {

    // Get logged-in user
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      this.user = JSON.parse(storedUser);
      this.username = this.user.username;
    }
    this.loadGroups();

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
  
  loadGroups(): void {

    this.groupService.getGroups().subscribe({
      next: (groups) => {

        this.groups = groups;

        for (const group of groups) {

          this.groupService.getChannels(group._id).subscribe({
            next: (channels) => {

              const containsCurrentChannel =
                channels.some(
                  channel => channel._id === this.channelId
                );

              if (containsCurrentChannel) {
                this.selectedGroup = group;
                this.channels = channels;
                this.cdr.detectChanges();
              }

            }
          });

        }

        this.cdr.detectChanges();
      }
    });
  }

  selectGroup(group: Group): void {

    // Immediately clear channels from the previous group
    this.selectedGroup = group;
    this.channels = [];

    this.groupService.getChannels(group._id).subscribe({
      next: (channels) => {

        this.channels = channels;

        // Automatically open first channel in selected group
        if (channels.length > 0) {
          this.openChannel(channels[0]);
        }

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Unable to load channels:', error);
        this.channels = [];
        this.cdr.detectChanges();
      }
    });
  }

  openChannel(channel: Channel): void {

    this.router.navigate([
      '/chat',
      channel._id,
      channel.name
    ]);

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
        this.user?.profileImage || ''
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
          this.user?.profileImage || ''
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
  createChannel(): void {
    if (!this.selectedGroup || !this.newChannelName.trim()) {
      return;
    }

    this.groupService.createChannel(
      this.newChannelName.trim(),
      this.selectedGroup._id
    ).subscribe({
      next: () => {
        this.newChannelName = '';
        this.showChannelForm = false;

        // Reload channels
        this.groupService.getChannels(
          this.selectedGroup!._id
        ).subscribe({
          next: (channels) => {
            this.channels = channels;
            this.cdr.detectChanges();
          }
        });
      },
      error: (error) => {
        console.error('Unable to create channel:', error);
      }
    });
  }
  createGroup(): void {
    if (!this.newGroupName.trim()) {
      return;
    }

    this.groupService.createGroup(
      this.newGroupName.trim()
    ).subscribe({
      next: () => {
        this.newGroupName = '';
        this.showGroupForm = false;
        this.loadGroups();
      },
      error: (error) => {
        console.error('Unable to create group:', error);
      }
    });
  }
  deleteChannel(
    event: MouseEvent,
    channel: Channel
  ): void {

    // Prevent clicking X from opening the channel
    event.stopPropagation();

    const confirmed = confirm(
      `Delete channel "${channel.name}"?`
    );

    if (!confirmed) {
      return;
    }

    this.groupService.deleteChannel(channel._id).subscribe({
      next: () => {

        this.channels = this.channels.filter(
          item => item._id !== channel._id
        );

        // If currently viewing the deleted channel
        if (this.channelId === channel._id) {

          if (this.channels.length > 0) {
            this.openChannel(this.channels[0]);
          } else {
            this.router.navigate(['/groups']);
          }

        }

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Unable to delete channel:', error);
      }
    });
  }
}