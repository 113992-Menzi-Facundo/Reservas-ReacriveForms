import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { VenueService } from '../service/venue.service';
import { Booking, BookingService, Service, Venue } from '../../interfaces';
import { ServiceService } from '../service/service.service';
import { BookingsService } from '../service/bookings.service';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './order-form.component.html',
  styleUrl: './order-form.component.css',
})
export class OrderFormComponent implements OnInit {
  ngOnInit(): void {
    this.loadVenues();
    this.loadServices();
    this.bookingform.valueChanges.subscribe(() => {
      this.calculateTotal();
    });
  }
  venueService: VenueService = inject(VenueService);
  venues: Venue[] = [];

  serviceService: ServiceService = inject(ServiceService);
  serviceList: Service[] = [];

  bookingsService: BookingsService = inject(BookingsService);

  bookingform: FormGroup;
  router: Router = inject(Router);

  totalAmount = 0;
  discount = 0; 
  totalAmountWithDiscount = 0;
  totalService = 0;

  constructor(private fb: FormBuilder) {
    this.bookingform = this.fb.group({
      companyName: ['', Validators.required],
      companyEmail: ['', [Validators.required,Validators.email],[]],
      contactPhone: ['', Validators.required],
      venueId: ['', Validators.required],
      eventDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      totalPeople: ['', Validators.required],
      services: this.fb.array([]),
    });
  }
  addServices() {
    const serviceGroup = this.fb.group({
      serviceId: ['', Validators.required],
      quantity: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
    });
    this.services.push(serviceGroup);
  }
  removeServices(index: number) {
    this.services.removeAt(index);
  }
  generateBookingCode(): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    return code;
  }

  get services(): FormArray {
    return this.bookingform.get('services') as FormArray;
  }
  goLista() {
    this.router.navigate(['booking']);
  }
  loadVenues(): void {
    this.venueService.getVenues().subscribe({
      next: (venue: Venue[]) => {
        this.venues = venue;
      },
      error() {
        alert('Error al cargar los lugares');
      },
    });
  }
  loadServices(): void {
    this.serviceService.getService().subscribe({
      next: (service: Service[]) => {
        this.serviceList = service;
      },
      error() {
        alert('Error al cargar services');
      },
    });
  }
  calculateTotal(): void {
    let total = 0;

    const totalPeople = this.bookingform.get('totalPeople')?.value;

    const startTime = this.bookingform.get('startTime')?.value;
    const endTime = this.bookingform.get('endTime')?.value;
    const venueId = this.bookingform.get('venueId')?.value;
    const venue = this.venues.find((v) => v.id === venueId);

    if(venue && startTime && endTime){
      const start = new Date(`1970-01-01T${startTime}`);
      const end = new Date(`1970-01-01T${endTime}`);
      const eventDuration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      total += eventDuration *venue.pricePerHour
    }

    this.services.controls.forEach(serviceGroup => {
      const serviceId = serviceGroup.get('serviceId')?.value;
      const quantity = serviceGroup.get('quantity')?.value;
      const service = this.serviceList.find((s) => s.id === serviceId);
      
      if (service) {
        if(service.minimumPeople <= quantity){
          total += service.pricePerPerson * quantity;
          this.totalService = service.pricePerPerson * quantity;
        }
      }
    });
    this.totalAmount = total;
    if(totalPeople >= 100){
      this.discount = total * 0.15;
      this.totalAmountWithDiscount = total - this.discount;
    }
    else{
      this.discount = 0;
      this.totalAmountWithDiscount = total;
    }
  }
  onSubmit() {
    console.log('Formulario enviado');
    console.log(this.bookingform.value);
    const formValue = this.bookingform.getRawValue();
    const bookingService:BookingService[] = formValue.services.map((service: BookingService) => ({
      serviceId: service.serviceId,
      quantity: service.quantity,
      pricePerPerson: service.pricePerPerson,
      startTime: service.startTime,
      endTime: service.endTime, 
    }));
    const booking:Booking = {
      companyName: formValue.companyName,
      companyEmail: formValue.companyEmail,
      contactPhone: formValue.contactPhone,
      venueId: formValue.venueId,
      eventDate: formValue.eventDate,
      startTime: formValue.startTime,
      endTime: formValue.endTime,
      totalPeople: formValue.totalPeople,
      services: bookingService,
      status: 'pending',
      createdAt: new Date(),
      totalAmount: this.totalAmountWithDiscount,
      bookingCode: this.generateBookingCode(),
    };

    this.bookingsService.createBooking(booking).subscribe({
      next:(response)=>
      {
        console.log('Reserva creada', response );
        this.bookingform.reset();
        this.services.clear();
      },
      error(){
        alert('Error al crear la reserva');
      }
      
    });
      
    
  }
}
