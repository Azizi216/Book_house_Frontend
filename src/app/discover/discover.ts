import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { API_BASE_URL } from '../services/api.config';
import { Book, BookService } from '../services/book.service';

@Component({
  selector: 'app-discover',
  imports: [RouterLink],
  templateUrl: './discover.html',
  styleUrl: './discover.css'
})
export class Discover implements OnInit {
  private router = inject(Router);
  private bookService = inject(BookService);
  private authService = inject(AuthService);

  searchText = signal('');
  selectedCategory = signal('All');
  sortBy = signal('title');
  profileOpen = signal(false);
  selectedBook = signal<Book | null>(null);
  favorites = signal<string[]>([]);
  books = signal<Book[]>([]);
  loading = signal(false);
  errorMessage = signal('');

  userName = this.authService.getUserName();

  categories = computed(() => {
    const values = this.books()
      .map((book) => book.category)
      .filter((category) => !!category);

    return ['All', ...Array.from(new Set(values)).sort()];
  });

  filteredBooks = computed(() => {
    const search = this.searchText().toLowerCase();
    const category = this.selectedCategory();

    let result = this.books().filter(book => {
      const matchesSearch =
        book.title.toLowerCase().includes(search) ||
        book.author.toLowerCase().includes(search);

      const matchesCategory =
        category === 'All' || book.category === category;

      return matchesSearch && matchesCategory;
    });

    if (this.sortBy() === 'rating') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    } else if (this.sortBy() === 'year') {
      result = [...result].sort((a, b) => b.year - a.year);
    } else {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  });

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.bookService.getBooks().subscribe({
      next: (books) => {
        this.books.set(books);
        this.loading.set(false);
      },
      error: (error) => {
        console.log('BOOK LOAD ERROR:', error);
        this.errorMessage.set('Could not load books. Make sure the Django backend is running.');
        this.loading.set(false);
      },
    });
  }

  bookImage(book: Book): string {
    return book.image_file || book.image_url || '/book_house.png';
  }

  toggleFavorite(title: string) {
    this.favorites.update(items =>
      items.includes(title)
        ? items.filter(item => item !== title)
        : [...items, title]
    );
  }

  isFavorite(title: string) {
    return this.favorites().includes(title);
  }

  clearSearch() {
    this.searchText.set('');
  }

  openBook(book: Book) {
    this.selectedBook.set(book);
  }

  closeBook() {
    this.selectedBook.set(null);
  }

  startReading(book: Book) {
    if (!book.pdf_file) {
      alert('PDF file is not available for this book.');
      return;
    }

    const backendBaseUrl = API_BASE_URL.replace('/api', '');
    const pdfUrl = book.pdf_file.startsWith('http')
      ? book.pdf_file
      : `${backendBaseUrl}${book.pdf_file}`;

    window.open(pdfUrl, '_blank');
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
