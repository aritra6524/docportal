import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../appointment.service';
import { RegisterService } from '../register.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

interface Appointment {
  patfirstname: string;
  patlastname: string;
  patphone: string;
  patemail: string;
  docfirstname: string;
  doclastname: string;
  docemail: string;
  docregd: number;
  docspecialization: string;
  docqualification: string;
  clinicname: string;
  cliniccity: string;
  clinicaddress: string;
  doctime: string;
  appointmentDate: string;
  queue: number;
}

interface Result {
  patfirstname: string;
  patlastname: string;
  patphone: string;
  patemail: string;
  docfirstname: string;
  doclastname: string;
  docregd: number;
  docspecialization: string;
  docqualification: string;
  clinicname: string;
  cliniccity: string;
  clinicaddress: string;
  doctime: string;
  appointmentDate: string;
  queue: number;
}

interface Doctor {
  docfirstname: string;
  doclastname: string;
  docemail: string;
  docregd: number;
  docspecialization: string;
  docqualification: string;
  clinicname: string;
  cliniccity: string;
  clinicaddress: string;
  doctime: string;
  mon: boolean;
  tues: boolean;
  wed: boolean;
  thurs: boolean;
  fri: boolean;
  sat: boolean;
  sun: boolean;
}

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.css'],
})
export class PatientListComponent implements OnInit {
  selectedDoctor: Doctor;
  appointments: Appointment[] = [];
  results: Result[] = [];

  constructor(
    private hC: HttpClient,
    private registerServiceObj: RegisterService,
    private appointmentServiceObj: AppointmentService,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchAppointments();
  }

  fetchAppointments() {
    this.registerServiceObj.getCurrentDoctor().subscribe({
      next: (currentLoggedInDoctor) => {
        this.selectedDoctor = currentLoggedInDoctor;
      },
      error: (error) => {
        console.error('Error fetching doctor:', error);
      },
    });

    this.appointmentServiceObj.getAllAppointments().subscribe({
      next: (response) => {
        this.appointments = response['payload'];
        this.results = this.appointments.filter(
          (element) => element.docemail == this.selectedDoctor.docemail
        );
      },
      error: (err) => {
        console.log('Error is:', err);
      },
    });
  }

  onClickCancelAppointment(result: any) {
    this.appointmentServiceObj.cancelAppointment(result);
    this.router
      .navigateByUrl('/dashboard', { skipLocationChange: true })
      .then(() => {
        this.router.navigate([decodeURI(this.location.path())]);
      });
  }
}
