import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'http://localhost:8000/api/v1';

  constructor(private http: HttpClient) {}

  private getEncryptedToken(): string {
    const authTokenPass = environment.authTokenPass;
    const authTokenKey = CryptoJS.enc.Base64.parse(environment.authTokenKey);
    const authTokenIv = CryptoJS.enc.Utf8.parse(environment.authTokenIv);

    const encryptedToken = CryptoJS.AES.encrypt(authTokenPass, authTokenKey, {
      iv: authTokenIv,
      mode: CryptoJS.mode.CBC,
    }).toString();
    return encryptedToken;
  }

  get(endpoint: string, params: any = {}): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getEncryptedToken()}`,
    });

    return this.http.get(`${this.apiUrl}${endpoint}`, { headers, params });
  }

  post(endpoint: string, body: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getEncryptedToken()}`,
    });

    return this.http.post(`${this.apiUrl}${endpoint}`, body, { headers });
  }
  downloadExcel(endpoint: string): Observable<Blob> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getEncryptedToken()}`,
      Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    return this.http.get(`${this.apiUrl}${endpoint}`, {
      headers,
      responseType: 'blob' as 'json',
    }) as Observable<Blob>;
  }
  uploadExcel(endpoint: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('content', file, file.name);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getEncryptedToken()}`
    });

    return this.http.post(`${this.apiUrl}${endpoint}`, formData, { headers });
  }

}
