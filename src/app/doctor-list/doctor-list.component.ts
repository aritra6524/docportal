import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AppointmentService } from '../appointment.service';
import { RegisterService } from '../register.service';
import { FormGroup } from '@angular/forms';
import { Location } from '@angular/common';
import Swal from 'sweetalert2';

interface Doctor {
  docfirstname: string;
  doclastname: string;
  docregd: string;
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

interface Appointment {
  docfirstname: string;
  doclastname: string;
  docregd: string;
  docspecialization: string;
  docqualification: string;
  clinicname: string;
  cliniccity: string;
  clinicaddress: string;
  doctime: string;
  patfirstname: string;
  patlastname: string;
  patphone: number;
  patemail: string;
  appointmentDate: string;
  queue: number;
}

interface Result {
  docfirstname: string;
  doclastname: string;
  docregd: string;
  docspecialization: string;
  docqualification: string;
  clinicname: string;
  cliniccity: string;
  clinicaddress: string;
  doctime: string;
  patfirstname: string;
  patlastname: string;
  patphone: number;
  patemail: string;
  appointmentDate: string;
  queue: number;
}

interface Patient {
  patfirstname: string;
  patlastname: string;
  patphone: number;
  patemail: string;
}

@Component({
  selector: 'app-doctor-list',
  templateUrl: './doctor-list.component.html',
  styleUrls: ['./doctor-list.component.css'],
})
export class DoctorListComponent implements OnInit {
  docForm: FormGroup;

  selectedPatient: Patient;
  doctors: Doctor[] = [];
  appointments: Appointment[] = [];
  results: Result[] = [];
  apptfilters: Result[] = [];

  constructor(
    private hC: HttpClient,
    private router: Router,
    private appointmentServiceObj: AppointmentService,
    private registerServiceObj: RegisterService,
    private location: Location
  ) {}

  ngOnInit() {
    this.fetchDoctors();
    this.fetchAppointments();
  }

  fetchDoctors() {
    this.registerServiceObj.getAllDoctors().subscribe({
      next: (response) => {
        this.doctors = response['payload'];
      },
      error: (err) => {
        console.log('Error is:', err);
      },
    });
  }

  toAppointmentPage(doctor) {
    this.appointmentServiceObj.setDoctorDetails(doctor);
    this.router.navigate(['/dashboard/book-appointment-page']);
  }

  fetchAppointments() {
    this.registerServiceObj.getCurrentPatient().subscribe({
      next: (currentLoggedInPatient) => {
        this.selectedPatient = currentLoggedInPatient;
      },
      error: (error) => {
        console.error('Error fetching patient:', error);
      },
    });

    this.appointmentServiceObj.getAllAppointments().subscribe({
      next: (response) => {
        this.appointments = response['payload'];
        this.apptfilters = this.appointments.filter(
          (element) => element.patemail == this.selectedPatient.patemail
        );
      },
      error: (err) => {
        console.log('Error is:', err);
      },
    });

    // this.hC
    //   .get<Appointment[]>('http://localhost:3000/appointments-api/appointments')
    //   .subscribe(
    //     (data) => {
    //       this.appointments = data;
    //       console.log(this.appointments);
    //       this.apptfilters = this.appointments.filter(
    //         (element) => element.patemail == this.selectedPatient.patemail
    //       );
    //     },
    //     (error) => {
    //       console.error('Error fetching doctors:', error);
    //     }
    //   );

    // console.log(this.apptfilters);
    //   let count = 1;
    //   for (let apptfilter of this.apptfilters) {
    //     apptfilter.queue = count;
    //     count = count + 1;
    //   }

    //   for (var i=0; i<.jsonData.length; i++) {
    //     for (var key in json.jsonData[i]) {
    //         for (var j= 0; j<json.jsonData[i][key].length; j++) {
    //             console.log(json.jsonData[i][key][j])
    //         }
    //     }
    //  }
  }

  onClickCancelAppointment(appointment: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Your appointment will be parmanently deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        this.appointmentServiceObj.deleteAppointment(appointment).subscribe({
          next: (response) => {
            // alert('Appointment Deleted!');
            Swal.fire('Deleted', 'Your appointment is deleted!', 'error');
          },
          error: (err) => {
            console.log('Error is :', err);
          },
        });
        //Refresh the component
        this.router
          .navigateByUrl('/', { skipLocationChange: true })
          .then(() => {
            this.router.navigate([decodeURI(this.location.path())]);
          });
      } else if (result.isDismissed) {
        // console.log('Clicked No, File is safe!');
      }
    });

    // this.appointmentServiceObj.deleteAppointment(appointment).subscribe({
    //   next: (response) => {
    //     // alert('Appointment Deleted!');
    //     Swal.fire('Deleted', 'Your appointment is deleted!', 'warning');
    //   },
    //   error: (err) => {
    //     console.log('Error is :', err);
    //   },
    // });
    // //Refresh the component
    // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
    //   this.router.navigate([decodeURI(this.location.path())]);
    // });
  }
}
