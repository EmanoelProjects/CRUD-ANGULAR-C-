import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Financa } from '../interfaces/Financa.interface';

@Injectable({
  providedIn: 'root',
})
export class FinancasService {
  private http = inject(HttpClient);
  private _baseUrl = 'http://localhost:5044';
  constructor() {}

  getFinancas(): Observable<Financa[]> {
    return this.http.get<Financa[]>(`${this._baseUrl}api/Financas/todas`);
  }

  getFinanca(id: number): Observable<Financa> {
    return this.http.get<Financa>(`${this._baseUrl}api/Financas/${id}`);
  }

  postFinanca(financa: Financa): Observable<Financa> {
    return this.http.post<Financa>(`${this._baseUrl}api/Financas`, financa);
  }

  putFinanca(id: string, financa: Financa): Observable<Financa> {
    return this.http.put<Financa>(
      `${this._baseUrl}api/Financas/${id}`,
      financa
    );
  }

  getFinancasPage(
    page: number,
    pageSize: number,
    descricaoFiltro: string = '',
    tipoFiltro: string = '',
    startDate: string = '',
    endDate: string = ''
  ): Observable<any> {
    let url = `${this._baseUrl}api/Financas/?pageNumber=${page}&pageSize=${pageSize}&descricao=${descricaoFiltro}&tipo=${tipoFiltro}&startDate=${startDate}&endDate=${endDate}`;
    return this.http.get<any>(url);
  }

  deleteFinanca(id: string): Observable<any> {
    return this.http.delete<any>(`${this._baseUrl}api/Financas/${id}`);
  }
}
