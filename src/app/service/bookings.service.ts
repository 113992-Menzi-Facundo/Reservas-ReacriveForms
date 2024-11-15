import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Booking } from '../../interfaces';

@Injectable({
  providedIn: 'root'
})
export class BookingsService {
  private http: HttpClient = inject(HttpClient);
  private url = 'http://localhost:3000/bookings';

  getBooking():Observable<Booking[]> {
    return this.http.get<Booking[]>(this.url);
  }
  
  createBooking(booking:Booking):Observable<Booking> {
    return this.http.post<Booking>(this.url, booking);
  }
  constructor() { }
}
