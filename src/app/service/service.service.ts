import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Service } from '../../interfaces';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  private http: HttpClient = inject(HttpClient);
  private url = 'http://localhost:3000/services';

  getService():Observable<Service[]> {
    return this.http.get<Service[]>(this.url);
  }
  constructor() { }
}
