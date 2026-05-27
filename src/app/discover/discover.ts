import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
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
    const search = this.searchText().toLowerCase().trim();
    const category = this.selectedCategory();

    let result = this.books().filter((book) => {
      const title = book.title?.toLowerCase() || '';
      const author = book.author?.toLowerCase() || '';
      const bookCategory = book.category || '';

      const matchesSearch =
        title.includes(search) ||
        author.includes(search);

      const matchesCategory =
        category === 'All' || bookCategory === category;

      return matchesSearch && matchesCategory;
    });

    if (this.sortBy() === 'rating') {
      result = [...result].sort((a, b) => Number(b.rating) - Number(a.rating));
    } else if (this.sortBy() === 'year') {
      result = [...result].sort((a, b) => Number(b.year) - Number(a.year));
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
    if (book.image_url && book.image_url.trim() !== '') {
      return book.image_url;
    }

    return '/book_house.png';
  }

  toggleFavorite(title: string): void {
    this.favorites.update((items) =>
      items.includes(title)
        ? items.filter((item) => item !== title)
        : [...items, title]
    );
  }

  isFavorite(title: string): boolean {
    return this.favorites().includes(title);
  }

  clearSearch(): void {
    this.searchText.set('');
  }

  openBook(book: Book): void {
    this.selectedBook.set(book);
  }

  closeBook(): void {
    this.selectedBook.set(null);
  }

  startReading(book: Book): void {
    if (!book.pdf_url || book.pdf_url.trim() === '') {
      alert('PDF is not available for this book.');
      return;
    }

    window.open(book.pdf_url, '_blank');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}