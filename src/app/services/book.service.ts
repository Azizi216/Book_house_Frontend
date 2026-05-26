import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';

export interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  image_url: string;
  image_file?: string | null;
  pdf_file?: string | null;
  rating: number;
  year: number;
  pages: number;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class BookService {
  private http = inject(HttpClient);
  private booksUrl = `${API_BASE_URL}/books/`;

  getBooks(search = '', category = 'All'): Observable<Book[]> {
    let params = new HttpParams();

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    if (category && category !== 'All') {
      params = params.set('category', category);
    }

    return this.http.get<Book[]>(this.booksUrl, { params });
  }

  getBook(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.booksUrl}${id}/`);
  }
}
