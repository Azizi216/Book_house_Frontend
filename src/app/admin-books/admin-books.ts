import { Component, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
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
    const token = localStorage.getItem('access') || '';

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
    if (!this.title().trim() || !this.author().trim() || !this.category().trim()) {
      alert('Title, author, and category are required.');
      return;
    }

    const imageFile = this.selectedImageFile();
    const pdfFile = this.selectedPdfFile();

    if (imageFile && imageFile.size === 0) {
      alert('Selected image file is empty. Please choose another image.');
      return;
    }

    if (pdfFile && pdfFile.size === 0) {
      alert('Selected PDF file is empty. Please choose another PDF.');
      return;
    }

    const formData = new FormData();

    formData.append('title', this.title().trim());
    formData.append('author', this.author().trim());
    formData.append('category', this.category().trim());
    formData.append('image_url', this.imageUrl().trim());
    formData.append('rating', String(Number(this.rating()) || 0));
    formData.append('year', String(Number(this.year()) || new Date().getFullYear()));
    formData.append('pages', String(Number(this.pages()) || 0));
    formData.append('description', this.description().trim());

    if (imageFile) {
      formData.append('image_file', imageFile, imageFile.name);
    }

    if (pdfFile) {
      formData.append('pdf_file', pdfFile, pdfFile.name);
    }

    const id = this.editingId();

    if (id) {
      this.http.patch(`${this.apiUrl}${id}/`, formData, this.getHeaders()).subscribe({
        next: () => {
          alert('Book updated successfully.');
          this.resetForm();
          this.loadBooks();
        },
        error: (error: HttpErrorResponse) => {
          this.handleRequestError(error, 'Update failed');
        },
      });
    } else {
      this.http.post(this.apiUrl, formData, this.getHeaders()).subscribe({
        next: () => {
          alert('Book created successfully.');
          this.resetForm();
          this.loadBooks();
        },
        error: (error: HttpErrorResponse) => {
          this.handleRequestError(error, 'Create failed');
        },
      });
    }
  }

  editBook(book: any) {
    this.editingId.set(book.id);
    this.title.set(book.title || '');
    this.author.set(book.author || '');
    this.category.set(book.category || '');
    this.imageUrl.set(book.image_url || '');
    this.rating.set(Number(book.rating) || 0);
    this.year.set(Number(book.year) || new Date().getFullYear());
    this.pages.set(Number(book.pages) || 0);
    this.description.set(book.description || '');

    this.selectedImageFile.set(null);
    this.selectedPdfFile.set(null);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteBook(id: number) {
    if (!confirm('Delete this book?')) {
      return;
    }

    this.http.delete(`${this.apiUrl}${id}/`, this.getHeaders()).subscribe({
      next: () => {
        this.loadBooks();
      },
      error: (error: HttpErrorResponse) => {
        this.handleRequestError(error, 'Delete failed');
      },
    });
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;

    if (!file) {
      this.selectedImageFile.set(null);
      return;
    }

    if (file.size === 0) {
      alert('Selected image file is empty.');
      input.value = '';
      this.selectedImageFile.set(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please choose a valid image file.');
      input.value = '';
      this.selectedImageFile.set(null);
      return;
    }

    this.selectedImageFile.set(file);
  }

  onPdfSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;

    if (!file) {
      this.selectedPdfFile.set(null);
      return;
    }

    if (file.size === 0) {
      alert('Selected PDF file is empty.');
      input.value = '';
      this.selectedPdfFile.set(null);
      return;
    }

    if (file.type !== 'application/pdf') {
      alert('Please choose a valid PDF file.');
      input.value = '';
      this.selectedPdfFile.set(null);
      return;
    }

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

  private handleRequestError(error: HttpErrorResponse, fallbackMessage: string) {
    console.log(`${fallbackMessage}:`, error);
    console.log('Backend error body:', error.error);

    if (error.status === 401) {
      alert(`${fallbackMessage}. Your login expired. Please login again.`);
      this.logout();
      return;
    }

    if (error.status === 403) {
      alert(`${fallbackMessage}. Your account is not admin/staff.`);
      return;
    }

    if (error.status === 400 && error.error) {
      alert(`${fallbackMessage}: ${JSON.stringify(error.error)}`);
      return;
    }

    if (error.status === 500) {
      alert(`${fallbackMessage}. Backend server error. Check Render logs.`);
      return;
    }

    alert(`${fallbackMessage}. Status: ${error.status}`);
  }

  logout() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    localStorage.removeItem('username');

    this.router.navigate(['/login']);
  }
}