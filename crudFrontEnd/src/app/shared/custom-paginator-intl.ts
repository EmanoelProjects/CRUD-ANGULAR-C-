import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class CustomPaginatorIntl extends MatPaginatorIntl {
  override getRangeLabel = (
    page: number,
    pageSize: number,
    length: number
  ): string => {
    const totalPages = Math.ceil(length / pageSize);

    return `${page} / ${Math.max(totalPages - 1, 0)}`;
  };
}
