import { Component, ViewChild, HostListener } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { FinancasService } from '../../services/financas.service';
import { CommonModule, DatePipe } from '@angular/common';
import { TuiDataList } from '@taiga-ui/core';
import { TuiDataListWrapper } from '@taiga-ui/kit';
import { TuiSelectModule } from '@taiga-ui/legacy';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CustomPaginatorIntl } from '../../shared/custom-paginator-intl';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { FinancaFormComponent } from '../financa-form/financa-form.component';
import { Financa } from '../../interfaces/Financa.interface';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    CommonModule,
    TuiSelectModule,
    TuiDataList,
    TuiDataListWrapper,
    SidebarComponent,
    MatIconModule,
    FinancaFormComponent,
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: CustomPaginatorIntl },
    DatePipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  financas: any[] = [];
  financasSemFiltro: Financa[] = [];
  displayedColumns: string[] = ['descricao', 'valor', 'tipo', 'data', 'acoes'];
  totalRegistros: number = 0;
  itensPorPagina: number = 10;
  paginaAtual: number = 0;
  descricaoFiltro: string = '';
  tipoFiltro: string = '';
  inicial: string = '';
  final: string = '';
  showForm = false;
  financaParaEdicao: any = null;
  pageSizeOptions: number[] = [10, 25, 50];
  entradaTotal: number = 0;
  saidaTotal: number = 0;
  valorTotal: number = 0;
  isMobile: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  constructor(
    private financaService: FinancasService,
    private datePipe: DatePipe,
    private toastr: ToastrService
  ) {}

  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
  }

  carregarFinancas(): void {
    this.financaService.getFinancas().subscribe((result) => {
      this.financasSemFiltro = result;
      this.carregarTotais();
    });
    this.financaService
      .getFinancasPage(
        this.paginaAtual + 1,
        this.itensPorPagina,
        this.descricaoFiltro,
        this.tipoFiltro,
        this.inicial || '',
        this.final || ''
      )
      .subscribe((result) => {
        this.financas = result.items;
        this.totalRegistros = result.totalRegistros;

        const totalPages = Math.ceil(this.totalRegistros / this.itensPorPagina);

        if (this.totalRegistros === 0) {
          this.paginaAtual = 0;
        }

        if (this.paginaAtual >= totalPages && totalPages > 0) {
          this.paginaAtual = totalPages - 1;
        }

        this.paginator.pageIndex = this.paginaAtual;
      });

    this.financaService.getFinancas().subscribe((result) => {
      this.financasSemFiltro = result;
    });
  }

  formatDate(date: string | Date): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
  }

  onPageChange(event: PageEvent): void {
    this.paginaAtual = event.pageIndex;
    this.itensPorPagina = event.pageSize;
    this.carregarFinancas();
  }

  onPageSizeChange(newSize: number): void {
    this.itensPorPagina = newSize;

    const totalPages = Math.ceil(this.totalRegistros / this.itensPorPagina);

    if (this.paginaAtual >= totalPages && totalPages > 0) {
      this.paginaAtual = totalPages - 1;
    }

    this.paginator.pageIndex = this.paginaAtual;
    this.carregarFinancas();
  }

  onDescricaoChange(descricao: string): void {
    this.descricaoFiltro = descricao;
    this.paginaAtual = 0;
    this.carregarFinancas();
  }

  onTipoChange(tipo: string): void {
    this.tipoFiltro = tipo;
    this.paginaAtual = 0;
    this.carregarFinancas();
  }

  onDateRangeChange(dateRange: { start: string; end: string }) {
    if (!dateRange.start || !dateRange.end) {
      this.inicial = '';
      this.final = '';
    } else {
      this.inicial = dateRange.start;
      this.final = dateRange.end;
    }
    this.paginaAtual = 0;
    this.carregarFinancas();
  }

  deleteFinanca(id: string): void {
    this.financaService.deleteFinanca(id).subscribe(
      () => {
        this.financas = this.financas.filter((financa) => financa.id !== id);
        this.carregarFinancas();
        this.totalRegistros--;

        if (this.financas.length === 0 && this.paginaAtual > 0) {
          this.paginaAtual--;
        }

        this.toastr.success('Finança removia com sucesso!', '', {
          timeOut: 2000,
          positionClass: 'toast-top-right',
          progressBar: true,
          toastClass: 'ngx-toastr toast-custom toast-delete',
        });
      },
      (error) => {
        console.error('Erro ao excluir finança:', error);
        alert('Erro ao excluir finança. Tente novamente mais tarde.');
      }
    );
  }

  onEditForm(financa: Financa) {
    this.openForm();
    this.financaParaEdicao = { ...financa };
  }

  openForm() {
    this.showForm = true;
  }

  closeForm() {
    this.financaParaEdicao = null;
    this.showForm = false;
  }

  financaCriada() {
    this.carregarFinancas();
  }

  carregarTotais() {
    this.entradaTotal = this.financasSemFiltro
      .filter((financa) => financa.tipo === 'entrada')
      .reduce((total, financa) => total + (parseFloat(financa.valor) || 0), 0);

    this.saidaTotal = this.financasSemFiltro
      .filter((financa) => financa.tipo === 'saida')
      .reduce((total, financa) => total + (parseFloat(financa.valor) || 0), 0);

    this.valorTotal = this.entradaTotal - this.saidaTotal;
  }

  ngOnInit(): void {
    this.carregarFinancas();
    this.checkScreenSize();
  }
}
