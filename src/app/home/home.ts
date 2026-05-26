import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  selectedCategory = signal('All');

  categories = ['All', 'Novel', 'Education', 'History', 'Technology'];

  books = [
    { title: 'Atomic Habits', category: 'Education', author: 'James Clear' },
    { title: 'The Great Gatsby', category: 'Novel', author: 'F. Scott Fitzgerald' },
    { title: 'Clean Code', category: 'Technology', author: 'Robert C. Martin' },
    { title: 'Sapiens', category: 'History', author: 'Yuval Noah Harari' }
  ];

  filteredBooks = computed(() => {
    if (this.selectedCategory() === 'All') return this.books;
    return this.books.filter(book => book.category === this.selectedCategory());
  });

  scrollTo(sectionId: string) {
  const section = document.getElementById(sectionId);

  if (section) {
    section.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}
}