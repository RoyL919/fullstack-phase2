import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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

  constructor(
    private groupService: GroupService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.groupService.getGroups().subscribe({
      next: (groups) => {
        this.groups = groups;
        this.cdr.detectChanges();
      },
      error: () => {
        this.message = 'Unable to load groups.';
        this.cdr.detectChanges();
      }
    });
  }

  selectGroup(group: Group): void {
    this.selectedGroup = group;

    this.groupService.getChannels(group._id).subscribe({
      next: (channels) => {
        this.channels = channels;
        this.cdr.detectChanges();
      },
      error: () => {
        this.message = 'Unable to load channels.';
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
}