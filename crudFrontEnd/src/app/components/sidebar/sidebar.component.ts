import { Component, EventEmitter, Output } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule, DatePipe } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import {
  FormsModule,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  imports: [
    MatSelectModule,
    CommonModule,
    FormsModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIcon,
  ],
  providers: [DatePipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  @Output() pageSizeChanged = new EventEmitter<number>();
  @Output() descricaoChanged = new EventEmitter<string>();
  @Output() tipoChanged = new EventEmitter<string>();
  @Output() dateRangeChanged = new EventEmitter<{
    start: string;
    end: string;
  }>();

  @Output() openForm = new EventEmitter<void>();

  readonly range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  constructor(private datePipe: DatePipe) {
    this.range.valueChanges.subscribe((value) => this.onDateChange(value));
  }

  itensPorPagina = 10;
  pageSizeOptions: number[] = [10, 25, 50];
  descricaoFiltro = '';
  tipoFiltro = 'Todos';

  onPageSizeChange(pageSize: number) {
    this.pageSizeChanged.emit(pageSize);
  }

  onDescricaoChange() {
    this.descricaoChanged.emit(this.descricaoFiltro);
  }

  onTipoChange() {
    this.tipoChanged.emit(this.tipoFiltro);
  }

  onDateChange(value: Partial<{ start: Date | null; end: Date | null }>) {
    const startDate: Date | null = value.start ?? null;
    const endDate: Date | null = value.end ?? null;

    if (startDate && endDate) {
      const formattedRange = {
        start: this.datePipe.transform(startDate, 'dd/MM/yyyy') || '',
        end: this.datePipe.transform(endDate, 'dd/MM/yyyy') || '',
      };
      this.dateRangeChanged.emit(formattedRange);
    }
  }

  openFormm(): void {
    this.openForm.emit();
  }

  onCancelDate(): void {
    this.range.reset();
    this.dateRangeChanged.emit({ start: '', end: '' });
  }
}
