import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './auth';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:3000/api/users';

  private getHeaders(): HttpHeaders {
    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      return new HttpHeaders();
    } 

    const user = JSON.parse(storedUser);

    return new HttpHeaders({
      'user-id': user._id
    });
  }

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(
      this.apiUrl,
      {
        headers: this.getHeaders()
      }
    );
  }

  updateRole(id: string, role: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${id}/role`,
      { role },
      {
        headers: this.getHeaders()
      }
    );
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }
}