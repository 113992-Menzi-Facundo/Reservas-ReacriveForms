import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Venue } from '../../interfaces';

@Injectable({
  providedIn: 'root'
})
export class VenueService {
  
  private http: HttpClient = inject(HttpClient);
  private url = 'http://localhost:3000/venues';

  getVenues():Observable<Venue[]> {
    return this.http.get<Venue[]>(this.url);
  }
  constructor() { }
}
