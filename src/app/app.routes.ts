import { Routes } from '@angular/router';
import { OrderListComponent } from './order-list/order-list.component';
import { OrderFormComponent } from './order-form/order-form.component';

export const routes: Routes = [
    {path: '', redirectTo: 'create-booking', pathMatch: 'full'},
    {path: 'booking', component: OrderListComponent},
    {path: 'create-booking', component: OrderFormComponent},
];
