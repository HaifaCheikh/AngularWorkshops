import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Suggestion } from '../../../models/suggestion';

@Component({
  selector: 'app-list-suggestion',
  templateUrl: './list-suggestion.component.html',
  styleUrls: ['./list-suggestion.component.css']
})
export class ListSuggestionComponent implements OnInit {
  searchText: string = '';
  favorites: Suggestion[] = [];
  currentFilter: string = 'all';
  showFavoritesView: boolean = false;
  
  // Pour vérifier si on est dans le navigateur
  private isBrowser: boolean;
  
  // Suggestions par défaut (exemples)
  defaultSuggestions: Suggestion[] = [
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

  // Liste complète des suggestions (par défaut + nouvelles)
  suggestions: Suggestion[] = [];

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    // ORDRE IMPORTANT : charger d'abord les suggestions, puis les likes
    this.loadAllSuggestions();
    this.loadLikesFromStorage();
    this.loadFavoritesFromStorage();
  }

  // Charger toutes les suggestions (par défaut + localStorage)
  loadAllSuggestions(): void {
    // Commencer avec les suggestions par défaut
    this.suggestions = [...this.defaultSuggestions];

    // Charger les suggestions ajoutées par l'utilisateur
    if (this.isBrowser) {
      const savedSuggestions = localStorage.getItem('all_suggestions');
      if (savedSuggestions) {
        try {
          const userSuggestions = JSON.parse(savedSuggestions);
          // Ajouter les suggestions utilisateur APRÈS les suggestions par défaut
          this.suggestions = [...this.suggestions, ...userSuggestions];
          console.log('✅ Total suggestions:', this.suggestions.length);
        } catch (error) {
          console.error('❌ Erreur chargement suggestions:', error);
        }
      }
    }
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
    if (!this.isBrowser) return;

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
    if (!this.isBrowser) return;

    const likesData: { [key: number]: number } = {};
    this.suggestions.forEach(suggestion => {
      likesData[suggestion.id] = suggestion.nbLikes;
    });
    localStorage.setItem('suggestion_likes', JSON.stringify(likesData));
  }

  loadFavoritesFromStorage(): void {
    if (!this.isBrowser) return;

    const savedFavorites = localStorage.getItem('suggestion_favorites');
    if (savedFavorites) {
      try {
        const favoriteIds: number[] = JSON.parse(savedFavorites);
        this.favorites = this.suggestions.filter(s => favoriteIds.includes(s.id));
        console.log('✅ Favoris chargés:', this.favorites.length);
      } catch (error) {
        console.error('Erreur chargement favoris:', error);
      }
    }
  }

  saveFavoritesToStorage(): void {
    if (!this.isBrowser) return;

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

  // FILTRAGE CORRIGÉ
  get filteredSuggestions(): Suggestion[] {
    // Étape 1 : Choisir la source (favoris ou toutes les suggestions)
    let result = this.showFavoritesView ? [...this.favorites] : [...this.suggestions];

    console.log('🔍 Filtrage - Source:', this.showFavoritesView ? 'Favoris' : 'Toutes');
    console.log('🔍 Nombre de suggestions de départ:', result.length);
    console.log('🔍 Filtre actif:', this.currentFilter);

    // Étape 2 : Appliquer le filtre de statut (UNIQUEMENT si pas en vue favoris)
    if (this.currentFilter !== 'all' && !this.showFavoritesView) {
      result = result.filter(s => s.status === this.currentFilter);
      console.log('🔍 Après filtre statut:', result.length, 'suggestions');
    }

    // Étape 3 : Appliquer la recherche par texte
    if (this.searchText && this.searchText.trim() !== '') {
      const searchLower = this.searchText.toLowerCase().trim();
      result = result.filter(s => 
        s.title.toLowerCase().includes(searchLower) ||
        s.category.toLowerCase().includes(searchLower) ||
        s.description.toLowerCase().includes(searchLower)
      );
      console.log('🔍 Après recherche:', result.length, 'suggestions');
    }

    // Étape 4 : Trier par date (plus récent d'abord)
    result = result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });

    console.log('✅ Résultat final:', result.length, 'suggestions');
    return result;
  }

  incrementLikes(suggestion: Suggestion): void {
    suggestion.nbLikes++;
    this.saveLikesToStorage();
  }

  addToFavorites(suggestion: Suggestion): void {
    if (!this.favorites.find(f => f.id === suggestion.id)) {
      this.favorites.push(suggestion);
      this.saveFavoritesToStorage();
      console.log('⭐ Ajouté aux favoris:', suggestion.title);
    }
  }

  removeFromFavorites(suggestion: Suggestion): void {
    this.favorites = this.favorites.filter(f => f.id !== suggestion.id);
    this.saveFavoritesToStorage();
    console.log('❌ Retiré des favoris:', suggestion.title);
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
    console.log('🎯 Changement de filtre:', filter);
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
}