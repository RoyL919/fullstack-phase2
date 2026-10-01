import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {

  user: any = null;
  selectedImage: File | null = null;

  uploading = false;
  message = '';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      this.user = JSON.parse(storedUser);
    }
  }

  selectImage(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedImage = input.files[0];
    }
  }

  uploadProfileImage(): void {

    if (!this.selectedImage || !this.user) {
      this.message = 'Please select an image.';
      return;
    }

    const formData = new FormData();
    formData.append('image', this.selectedImage);

    this.uploading = true;

    // First upload the image
    this.http.post<any>(
      'http://localhost:3000/api/uploads',
      formData
    ).subscribe({

      next: (uploadResponse) => {

        // Then save the image URL to the user
        this.http.put<any>(
          `http://localhost:3000/api/users/${this.user._id}/profile-image`,
          {
            profileImage: uploadResponse.imageUrl
          }
        ).subscribe({

          next: (response) => {

            this.user.profileImage = response.profileImage;

            // Update localStorage too
            localStorage.setItem(
              'user',
              JSON.stringify(this.user)
            );

            this.selectedImage = null;
            this.uploading = false;
            this.message = 'Profile image updated successfully.';

            this.cdr.detectChanges();
          },

          error: (error) => {
            console.error(error);
            this.uploading = false;
            this.message = 'Unable to update profile image.';
            this.cdr.detectChanges();
          }
        });
      },

      error: (error) => {
        console.error(error);
        this.uploading = false;
        this.message = 'Image upload failed.';
        this.cdr.detectChanges();
      }
    });
  }
}