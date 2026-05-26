import { Component, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { API_BASE_URL } from '../services/api.config';

@Component({
  selector: 'app-admin-books',
  imports: [FormsModule],
  templateUrl: './admin-books.html',
  styleUrl: './admin-books.css',
})
export class AdminBooks {
  private http = inject(HttpClient);
  private router = inject(Router);

  apiUrl = `${API_BASE_URL}/books/`;

  books = signal<any[]>([]);
  editingId = signal<number | null>(null);

  title = signal('');
  author = signal('');
  category = signal('');
  imageUrl = signal('');
  rating = signal(0);
  year = signal(new Date().getFullYear());
  pages = signal(0);
  description = signal('');

  selectedImageFile = signal<File | null>(null);
  selectedPdfFile = signal<File | null>(null);

  ngOnInit() {
    if (!localStorage.getItem('access')) {
      this.router.navigate(['/login']);
      return;
    }

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
    formData.append('rating', String(this.rating() || 0));
    formData.append('year', String(this.year() || new Date().getFullYear()));
    formData.append('pages', String(this.pages() || 0));
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
          alert('Update failed. Make sure you are logged in as admin.');
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
          alert('Create failed. Make sure you are logged in as admin.');
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
    this.rating.set(book.rating || 0);
    this.year.set(book.year || new Date().getFullYear());
    this.pages.set(book.pages || 0);
    this.description.set(book.description || '');

    this.selectedImageFile.set(null);
    this.selectedPdfFile.set(null);
  }

  deleteBook(id: number) {
    if (!confirm('Delete this book?')) {
      return;
    }

    this.http.delete(`${this.apiUrl}${id}/`, this.getHeaders()).subscribe({
      next: () => {
        this.loadBooks();
      },
      error: (error) => {
        console.log('Delete failed:', error);
        alert('Delete failed. Make sure you are logged in as admin.');
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
    this.rating.set(0);
    this.year.set(new Date().getFullYear());
    this.pages.set(0);
    this.description.set('');

    this.selectedImageFile.set(null);
    this.selectedPdfFile.set(null);
  }

  logout() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    localStorage.removeItem('username');

    this.router.navigate(['/login']);
  }
}
