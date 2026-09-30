import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UserService } from '../services/user';
import { User } from '../services/auth';


@Component({
  selector: 'app-admin',
  imports: [],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {

  users: User[] = [];
  message = '';

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        console.log('Users received:', users);

        this.users = users;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Error loading users:', error);
        this.message = 'Unable to load users.';
        this.cdr.detectChanges();
      }
    });
  }

  changeRole(user: User): void {
    const newRole = user.role === 'admin' ? 'user' : 'admin';

    this.userService.updateRole(user._id, newRole).subscribe({
      next: () => {
        this.message = 'Role updated successfully.';
        this.loadUsers();
      },
      error: () => {
        this.message = 'Unable to update role.';
      }
    });
  }

  deleteUser(user: User): void {
    if (!confirm(`Delete user "${user.username}"?`)) {
      return;
    }

    this.userService.deleteUser(user._id).subscribe({
      next: () => {
        this.message = 'User deleted successfully.';
        this.loadUsers();
      },
      error: () => {
        this.message = 'Unable to delete user.';
      }
    });
  }
}