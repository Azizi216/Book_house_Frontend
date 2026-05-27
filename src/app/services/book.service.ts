import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';

export interface Book {
  id: number;
  title: string;
  author: string;
  category: string;

  // Cloudinary URLs from Django
  image_url?: string | null;
  pdf_url?: string | null;

  rating: number;
  year: number;
  pages: number;
  description?: string;
}

export interface BookFormData {
  title: string;
  author: string;
  category: string;
  image_url?: string;
  rating: number;
  year: number;
  pages: number;
  description?: string;

  // files selected from computer
  image_file?: File | null;
  pdf_file?: File | null;
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

  createBook(book: BookFormData): Observable<Book> {
    const formData = this.buildFormData(book);
    return this.http.post<Book>(this.booksUrl, formData);
  }

  updateBook(id: number, book: BookFormData): Observable<Book> {
    const formData = this.buildFormData(book);
    return this.http.put<Book>(`${this.booksUrl}${id}/`, formData);
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.booksUrl}${id}/`);
  }

  private buildFormData(book: BookFormData): FormData {
    const formData = new FormData();

    formData.append('title', book.title);
    formData.append('author', book.author);
    formData.append('category', book.category);
    formData.append('rating', String(book.rating));
    formData.append('year', String(book.year));
    formData.append('pages', String(book.pages));
    formData.append('description', book.description || '');

    if (book.image_url) {
      formData.append('image_url', book.image_url);
    }

    if (book.image_file) {
      formData.append('image_file', book.image_file);
    }

    if (book.pdf_file) {
      formData.append('pdf_file', book.pdf_file);
    }

    return formData;
  }
}