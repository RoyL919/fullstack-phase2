import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Group {
  _id: string;
  name: string;
  members: string[];
  createdAt: string;
}

export interface Channel {
  _id: string;
  name: string;
  groupId: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  private groupsUrl = 'http://localhost:3000/api/groups';
  private channelsUrl = 'http://localhost:3000/api/channels';

  constructor(private http: HttpClient) {}

  getGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(this.groupsUrl);
  }

  createGroup(name: string): Observable<any> {
    return this.http.post(this.groupsUrl, { name });
  }

  deleteGroup(id: string): Observable<any> {
    return this.http.delete(`${this.groupsUrl}/${id}`);
  }

  addMember(groupId: string, userId: string): Observable<any> {
    return this.http.post(
      `${this.groupsUrl}/${groupId}/members/${userId}`,
      {}
    );
  }

  removeMember(groupId: string, userId: string): Observable<any> {
    return this.http.delete(
      `${this.groupsUrl}/${groupId}/members/${userId}`
    );
  }

  getChannels(groupId: string): Observable<Channel[]> {
    return this.http.get<Channel[]>(
      `${this.channelsUrl}/group/${groupId}`
    );
  }

  createChannel(name: string, groupId: string): Observable<any> {
    return this.http.post(this.channelsUrl, {
      name,
      groupId
    });
  }

  deleteChannel(id: string): Observable<any> {
    return this.http.delete(`${this.channelsUrl}/${id}`);
  }
}