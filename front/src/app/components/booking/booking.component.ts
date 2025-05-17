import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import Swal from 'sweetalert2';
import { ChangeDetectorRef } from '@angular/core';
import { AppConstants } from '../../constants/constants';



import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,

  ],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {
  displayedColumns: string[] = ['first_name', 'last_name', 'birthday', 'document', 'departure_iata', 'departure_date', 'arrival_iata', 'arrival_date'];
  dataSource = new MatTableDataSource<any>();
  openModal = false;
  cpfInvalido: boolean = false
  modalMode: 'form' | 'upload' = 'form';
  isExcelModal= false;
  isDragging = false;
  selectedFile: File | null = null;
  bookings: any[] = [];
  isEditMode = false;
  today: Date = new Date();
  aeroportos: string[] = [];

  formData = {
    first_name: '',
    last_name: '',
    birthday: '',
    document: '',
    departure_date: '',
    departure_iata: '',
    arrival_iata: '',
    arrival_date: ''
  };


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private appConstants: AppConstants) {
      this.aeroportos = this.appConstants.aeroportosBrasilIATA;
    }

  ngOnInit(): void {
    this.getBookings();
  }

  getBookings(): void {
    this.apiService.get('/booking').subscribe(
      (response: any) => {
        this.dataSource.data = response.data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      (error) => {
        console.error('Erro ao buscar bookings', error);
      }
    );
  }
  onSubmit(): void {
    if (this.formData.first_name && this.formData.last_name && this.formData.birthday
      && this.formData.document && this.formData.departure_date && this.formData.departure_iata
      && this.formData.arrival_iata && this.formData.arrival_date ) {
      this.validCpf()
    } else {
      Swal.fire('Erro!', 'Por favor, preencha todos os campos obrigatórios!', 'error');
    }
  }

  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().slice(0, 10);
  }


  createBooking(): void {
    this.apiService.post('/booking', this.formData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Reserva criada com sucesso!',
          text: 'Os dados foram salvos corretamente.',
          confirmButtonColor: '#3085d6'
        });
        this.openModal = false;
        this.getBookings();
        this.formData = {
          first_name: '',
          last_name: '',
          birthday: '',
          document: '',
          departure_date: '',
          departure_iata: '',
          arrival_iata: '',
          arrival_date: ''
        };

      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Erro ao criar reserva',
          text: 'Verifique os dados e tente novamente.',
          confirmButtonColor: '#d33'
        });
      }
    });

  }
  downloadFile(): void {
    this.apiService.downloadExcel('/booking/file/download').subscribe(
      (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'booking.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);

        Swal.fire('Sucesso!', 'O arquivo foi baixado com sucesso.', 'success');
      },
      (error) => {
        Swal.fire('Erro!', 'Não foi possível baixar o arquivo.', 'error');
      }
    );
  }
  formatCpf(cpf: string): string {
    if (!cpf) return '';
    cpf = cpf.replace(/\D/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  onDepartureDateChange(date: Date): void {
    this.formData.departure_date = this.formatDate(date);
    this.formData.arrival_date = '';
    if (this.formData.arrival_date && new Date(this.formData.arrival_date) < date) {
      this.formData.arrival_date = '';
    }
  }

  capitalizeField(field: 'first_name' | 'last_name') {
    this.formData[field] = this.formData[field]
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
    this.validateFile(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const file = event.dataTransfer?.files[0];
    this.validateFile(file);
  }

  validateFile(file: File | undefined): void {
    if (file && file.name.endsWith('.xlsx')) {
      this.selectedFile = file;
    } else {
      Swal.fire('Arquivo inválido', 'Envie um arquivo .xlsx', 'error');
    }
  }
  validCpf(): boolean {
    const documentNumber = this.formData.document.replace(/[^\d]/g, '');

    if (documentNumber.length !== 11 || !this.isValidCPF(documentNumber)) {
      this.cpfInvalido = true

      Swal.fire('Ops!', 'Por favor insira um CPF válido', 'error');
      return false;
    }
    this.createBooking();
    return true;
  }



  isValidCPF(cpf: string): boolean {
    if (cpf === '') return false;

    cpf = cpf.replace(/[^\d]/g, '');

    if (cpf.length !== 11 ||
        cpf === "00000000000" ||
        cpf === "11111111111" ||
        cpf === "22222222222" ||
        cpf === "33333333333" ||
        cpf === "44444444444" ||
        cpf === "55555555555" ||
        cpf === "66666666666" ||
        cpf === "77777777777" ||
        cpf === "88888888888" ||
        cpf === "99999999999") {
      return false;
    }

    let add = 0;
    for (let i = 0; i < 9; i++)
      add += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev == 10 || rev == 11)
      rev = 0;
    if (rev != parseInt(cpf.charAt(9)))
      return false;

    add = 0;
    for (let i = 0; i < 10; i++)
      add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11)
      rev = 0;
    if (rev != parseInt(cpf.charAt(10)))
      return false;

    return true;
  }



  validateCPF(): void {
    const rawDoc = this.formData.document?.trim() || '';
    const cleanedDoc = rawDoc.replace(/[^\d]/g, '');

    if (cleanedDoc.length === 0) {
      this.cpfInvalido = false;
    } else {
      this.cpfInvalido = !this.isValidCPF(cleanedDoc);
    }

    this.cdr.detectChanges();
  }


  closeUploadModal(): void {
    this.openModal = false;
    this.selectedFile = null;
    this.formData = {
      first_name: '',
      last_name: '',
      birthday: '',
      document: '',
      departure_date: '',
      departure_iata: '',
      arrival_date: '',
      arrival_iata: ''
    };
  }



  uploadFile(): void {
    if (!this.selectedFile) return;

    this.apiService.uploadExcel('/booking/file/upload', this.selectedFile).subscribe({
      next: () => {
        Swal.fire('Sucesso', 'Arquivo enviado com sucesso!', 'success');
        this.selectedFile = null;
        this.getBookings();
      },
      error: () => {
        Swal.fire('Erro', 'Falha ao enviar o arquivo.', 'error');
      }
    })
  }

  openNewBookingModal() {
    this.modalMode = 'form';
    this.isExcelModal = false;
    this.openModal = true;
  }

  openUploadModal() {
    this.modalMode = 'upload';
    this.isExcelModal = true;
    this.openModal = true;
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }
}
