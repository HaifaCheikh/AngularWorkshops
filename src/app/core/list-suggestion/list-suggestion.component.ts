import { Component, OnInit, Input } from '@angular/core';
import { Suggestion } from '../../models/suggestion';

@Component({
  selector: 'app-list-suggestion',
  templateUrl: './list-suggestion.component.html',
  styleUrls: ['./list-suggestion.component.css']
})
export class ListSuggestionComponent implements OnInit {
  @Input() currentView: string = 'dashboard';
  
  searchText: string = '';
  favorites: Suggestion[] = [];
  currentFilter: string = 'all';
  showFavoritesView: boolean = false;
  
  suggestions: Suggestion[] = [
    {
      id: 1,
      title: 'Organiser une journée team building',
      description: 'Suggestion pour organiser une journée de team building pour renforcer les liens entre les membres de l\'équipe et améliorer la cohésion d\'équipe.',
      category: 'Événements',
      date: new Date('2025-01-20'),
      status: 'acceptee',
      nbLikes: 10
    },
    {
      id: 2,
      title: 'Améliorer le système de réservation',
      description: 'Proposition pour améliorer la gestion des réservations en ligne avec un système de confirmation automatique et notifications en temps réel.',
      category: 'Technologie',
      date: new Date('2025-01-15'),
      status: 'refusee',
      nbLikes: 5
    },
    {
      id: 3,
      title: 'Créer un système de récompenses',
      description: 'Mise en place d\'un programme de récompenses pour motiver les employés et reconnaître leurs efforts avec des badges et points.',
      category: 'Ressources Humaines',
      date: new Date('2025-01-25'),
      status: 'refusee',
      nbLikes: 3
    },
    {
      id: 4,
      title: 'Moderniser l\'interface utilisateur',
      description: 'Refonte complète de l\'interface utilisateur pour une meilleure expérience utilisateur avec un design moderne et intuitif.',
      category: 'Technologie',
      date: new Date('2025-01-30'),
      status: 'en_attente',
      nbLikes: 15
    },
    {
      id: 5,
      title: 'Implémenter le télétravail hybride',
      description: 'Mise en place d\'une politique de télétravail hybride pour améliorer l\'équilibre vie professionnelle/vie personnelle.',
      category: 'Ressources Humaines',
      date: new Date('2025-02-01'),
      status: 'acceptee',
      nbLikes: 22
    },
    {
      id: 6,
      title: 'Optimiser les processus de recrutement',
      description: 'Automatisation et optimisation du processus de recrutement avec des outils d\'IA pour gagner du temps.',
      category: 'Ressources Humaines',
      date: new Date('2025-01-28'),
      status: 'en_attente',
      nbLikes: 8
    }
  ];

  ngOnInit(): void {
    this.loadLikesFromStorage();
    this.loadFavoritesFromStorage();
  }

  handleEmptyAction(): void {
    if (this.showFavoritesView) {
      this.showAllSuggestions();
    } else {
      this.searchText = '';
      this.setFilter('all');
    }
  }

  loadLikesFromStorage(): void {
    const savedLikes = localStorage.getItem('suggestion_likes');
    if (savedLikes) {
      try {
        const likesData = JSON.parse(savedLikes);
        this.suggestions.forEach(suggestion => {
          if (likesData[suggestion.id] !== undefined) {
            suggestion.nbLikes = likesData[suggestion.id];
          }
        });
      } catch (error) {
        console.error('Erreur chargement likes:', error);
      }
    }
  }

  saveLikesToStorage(): void {
    const likesData: { [key: number]: number } = {};
    this.suggestions.forEach(suggestion => {
      likesData[suggestion.id] = suggestion.nbLikes;
    });
    localStorage.setItem('suggestion_likes', JSON.stringify(likesData));
  }

  loadFavoritesFromStorage(): void {
    const savedFavorites = localStorage.getItem('suggestion_favorites');
    if (savedFavorites) {
      try {
        const favoriteIds: number[] = JSON.parse(savedFavorites);
        this.favorites = this.suggestions.filter(s => favoriteIds.includes(s.id));
      } catch (error) {
        console.error('Erreur chargement favoris:', error);
      }
    }
  }

  saveFavoritesToStorage(): void {
    const favoriteIds = this.favorites.map(f => f.id);
    localStorage.setItem('suggestion_favorites', JSON.stringify(favoriteIds));
  }

  showFavorites(): void {
    this.showFavoritesView = true;
    this.currentFilter = 'all';
  }

  showAllSuggestions(): void {
    this.showFavoritesView = false;
    this.currentFilter = 'all';
  }

  get filteredSuggestions(): Suggestion[] {
    let result = this.showFavoritesView ? [...this.favorites] : [...this.suggestions];

    if (this.currentFilter !== 'all' && !this.showFavoritesView) {
      result = result.filter(s => s.status === this.currentFilter);
    }

    if (this.searchText) {
      const searchLower = this.searchText.toLowerCase();
      result = result.filter(s => 
        s.title.toLowerCase().includes(searchLower) ||
        s.category.toLowerCase().includes(searchLower) ||
        s.description.toLowerCase().includes(searchLower)
      );
    }

    return result.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  incrementLikes(suggestion: Suggestion): void {
    suggestion.nbLikes++;
    this.saveLikesToStorage();
  }

  addToFavorites(suggestion: Suggestion): void {
    if (!this.favorites.find(f => f.id === suggestion.id)) {
      this.favorites.push(suggestion);
      this.saveFavoritesToStorage();
    }
  }

  removeFromFavorites(suggestion: Suggestion): void {
    this.favorites = this.favorites.filter(f => f.id !== suggestion.id);
    this.saveFavoritesToStorage();
  }

  isInFavorites(id: number): boolean {
    return this.favorites.some(f => f.id === id);
  }

  toggleFavorite(suggestion: Suggestion): void {
    if (this.isInFavorites(suggestion.id)) {
      this.removeFromFavorites(suggestion);
    } else {
      this.addToFavorites(suggestion);
    }
  }

  setFilter(filter: string): void {
    this.currentFilter = filter;
    this.showFavoritesView = false;
  }

  getAcceptedCount(): number {
    return this.suggestions.filter(s => s.status === 'acceptee').length;
  }

  getPendingCount(): number {
    return this.suggestions.filter(s => s.status === 'en_attente').length;
  }

  getRejectedCount(): number {
    return this.suggestions.filter(s => s.status === 'refusee').length;
  }

    getFavoritesCount(): number {
    return this.favorites.length;
  }

  // NOUVELLE MÉTHODE À AJOUTER
  showFavoritesOnly(): void {
    this.showFavoritesView = true;
    this.currentFilter = 'all';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

}