import {
  Component,
  EventEmitter,
  Output,
  Input,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { FinancasService } from '../../services/financas.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { NgxMaskDirective } from 'ngx-mask';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-financa-form',
  imports: [
    MatCardModule,
    MatDatepickerModule,
    MatButton,
    MatRadioModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    CommonModule,
    MatInputModule,
    MatIconModule,
    NgxMaskDirective,
  ],
  templateUrl: './financa-form.component.html',
  styleUrl: './financa-form.component.css',
})
export class FinancaFormComponent implements OnChanges {
  @Output() formClosed = new EventEmitter<void>();
  @Output() financaCriada = new EventEmitter<void>();

  @Input() financa: any = null;
  financaForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private financaService: FinancasService,
    private toastr: ToastrService
  ) {
    this.financaForm = this.fb.group({
      descricao: ['', Validators.required],
      valor: ['', [Validators.required, Validators.min(0.01)]],
      tipo: ['entrada', Validators.required],
      data: ['', Validators.required],
    });
  }

  editando = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['financa'] && this.financa) {
      this.editando = true;

      this.financaForm.patchValue({
        descricao: this.financa.descricao,
        valor: this.financa.valor,
        tipo: this.financa.tipo,
        data: this.financa.data,
      });

      this.financaForm.get('tipo')?.setValue(this.financa.tipo);
    } else {
      this.editando = false;
    }
  }

  onSubmit() {
    if (this.financaForm.valid) {
      const formValue = this.financaForm.value;
      formValue.valor = formValue.valor.toString();

      this.financaService.postFinanca(formValue).subscribe(() => {
        this.financaForm.reset();
        this.financaForm.markAsPristine();

        this.editando = false;
        this.financa = null;

        this.formClosed.emit();
        this.financaCriada.emit();

        this.toastr.success('Finança criada com sucesso!', '', {
          timeOut: 2000,
          positionClass: 'toast-top-right',
          progressBar: true,
          toastClass: 'ngx-toastr toast-custom toast-create',
        });
      });
    } else {
      this.financaForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.financaForm.reset();
    this.financaForm.markAsPristine();

    this.editando = false;
    this.financa = null;

    this.formClosed.emit();
  }

  edit() {
    if (this.financaForm.valid) {
      const formValue = this.financaForm.value;
      formValue.valor = formValue.valor.toString();

      this.financaService
        .putFinanca(this.financa.id, formValue)
        .subscribe(() => {
          this.financaForm.reset();
          this.financaForm.markAsPristine();

          this.editando = false;
          this.financa = null;

          this.formClosed.emit();
          this.financaCriada.emit();

          this.toastr.success('Finança editada com sucesso!', '', {
            timeOut: 2000,
            positionClass: 'toast-top-right',
            progressBar: true,
            toastClass: 'ngx-toastr toast-custom toast-update',
          });
        });
    } else {
      this.financaForm.markAllAsTouched();
    }
  }
}
