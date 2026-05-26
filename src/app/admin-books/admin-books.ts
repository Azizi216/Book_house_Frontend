import { Component, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-books',
  imports: [FormsModule],
  templateUrl: './admin-books.html',
  styleUrl: './admin-books.css',
})
export class AdminBooks {
  private http = inject(HttpClient);
  private router = inject(Router);

  apiUrl = 'http://127.0.0.1:8000/api/books/';

  books = signal<any[]>([]);
  editingId = signal<number | null>(null);

  title = signal('');
  author = signal('');
  category = signal('');
  imageUrl = signal('');
  rating = signal<number | null>(null);
  year = signal<number | null>(null);
  pages = signal<number | null>(null);
  description = signal('');

  selectedImageFile = signal<File | null>(null);
  selectedPdfFile = signal<File | null>(null);

  ngOnInit() {
    this.loadBooks();
  }

  getHeaders() {
    const token = localStorage.getItem('access');

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  loadBooks() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.books.set(data);
      },
      error: (error) => {
        console.log('Failed to load books:', error);
      },
    });
  }

  saveBook() {
    const formData = new FormData();

    formData.append('title', this.title());
    formData.append('author', this.author());
    formData.append('category', this.category());
    formData.append('image_url', this.imageUrl());
    formData.append('rating', String(this.rating()));
    formData.append('year', String(this.year()));
    formData.append('pages', String(this.pages()));
    formData.append('description', this.description());

    if (this.selectedImageFile()) {
      formData.append('image_file', this.selectedImageFile()!);
    }

    if (this.selectedPdfFile()) {
      formData.append('pdf_file', this.selectedPdfFile()!);
    }

    const id = this.editingId();

    if (id) {
      this.http.patch(`${this.apiUrl}${id}/`, formData, this.getHeaders()).subscribe({
        next: () => {
          this.resetForm();
          this.loadBooks();
        },
        error: (error) => {
          console.log('Update failed:', error);
        },
      });
    } else {
      this.http.post(this.apiUrl, formData, this.getHeaders()).subscribe({
        next: () => {
          this.resetForm();
          this.loadBooks();
        },
        error: (error) => {
          console.log('Create failed:', error);
        },
      });
    }
  }

  editBook(book: any) {
    this.editingId.set(book.id);
    this.title.set(book.title);
    this.author.set(book.author);
    this.category.set(book.category);
    this.imageUrl.set(book.image_url || '');
    this.rating.set(book.rating);
    this.year.set(book.year);
    this.pages.set(book.pages);
    this.description.set(book.description || '');

    this.selectedImageFile.set(null);
    this.selectedPdfFile.set(null);
  }

  deleteBook(id: number) {
    this.http.delete(`${this.apiUrl}${id}/`, this.getHeaders()).subscribe({
      next: () => {
        this.loadBooks();
      },
      error: (error) => {
        console.log('Delete failed:', error);
      },
    });
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.selectedImageFile.set(file);
  }

  onPdfSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.selectedPdfFile.set(file);
  }

  resetForm() {
    this.editingId.set(null);
    this.title.set('');
    this.author.set('');
    this.category.set('');
    this.imageUrl.set('');
    this.rating.set(null);
    this.year.set(null);
    this.pages.set(null);
    this.description.set('');

    this.selectedImageFile.set(null);
    this.selectedPdfFile.set(null);
  }

  logout() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');

    this.router.navigate(['/login']);
  }
}