import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  GroupService,
  Group,
  Channel
} from '../services/group';


@Component({
  selector: 'app-groups',
  imports: [FormsModule, RouterLink],
  templateUrl: './groups.html',
  styleUrl: './groups.css'
})
export class Groups implements OnInit {

  groups: Group[] = [];
  channels: Channel[] = [];

  selectedGroup: Group | null = null;

  newGroupName = '';
  newChannelName = '';

  message = '';
  user: any = null;

  showSettings = false;

  constructor(
    private groupService: GroupService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      this.user = JSON.parse(storedUser);
    }

    this.loadGroups();
  }

  loadGroups(): void {
    this.groupService.getGroups().subscribe({
      next: (groups) => {
        this.groups = groups;

        // Automatically open the first group
        if (this.groups.length > 0 && !this.selectedGroup) {
          this.selectGroup(this.groups[0]);
        }
      },
      error: () => {
        this.message = 'Unable to load groups.';
      }
    });
  }

  selectGroup(group: Group): void {
    this.selectedGroup = group;

    this.groupService.getChannels(group._id).subscribe({
      next: (channels) => {
        this.channels = channels;

        // Automatically open the first channel
        if (channels.length > 0) {
          this.router.navigate([
            '/chat',
            channels[0]._id,
            channels[0].name
          ]);
        }

        this.cdr.detectChanges();
      }
    });
  }

  createGroup(): void {
    if (!this.newGroupName.trim()) {
      this.message = 'Enter a group name.';
      return;
    }

    this.groupService.createGroup(this.newGroupName).subscribe({
      next: () => {
        this.newGroupName = '';
        this.message = 'Group created.';
        this.loadGroups();
      },
      error: (error) => {
        this.message =
          error.error?.message || 'Unable to create group.';
        this.cdr.detectChanges();
      }
    });
  }

  createChannel(): void {
    if (!this.selectedGroup || !this.newChannelName.trim()) {
      return;
    }

    this.groupService.createChannel(
      this.newChannelName,
      this.selectedGroup._id
    ).subscribe({
      next: () => {
        this.newChannelName = '';
        this.message = 'Channel created.';
        this.selectGroup(this.selectedGroup!);
      },
      error: (error) => {
        this.message =
          error.error?.message || 'Unable to create channel.';
        this.cdr.detectChanges();
      }
    });
  }

  toggleSettings(): void {
    this.showSettings = !this.showSettings;
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}