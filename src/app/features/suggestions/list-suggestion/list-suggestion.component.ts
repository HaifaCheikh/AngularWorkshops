import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Suggestion } from '../../../models/suggestion';
import { SuggestionService } from '../../../core/services/suggestion.service';

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
  suggestions: Suggestion[] = [];
  
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private suggestionService: SuggestionService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    console.log('🔄 Chargement des suggestions...');
    this.loadSuggestionsFromService();
  }

  loadSuggestionsFromService(): void {
    this.suggestionService.getAllSuggestions().subscribe({
      next: (data: Suggestion[]) => {
        console.log('✅ Suggestions depuis API:', data.length);
        this.suggestions = data;
        
        // Charger les likes depuis localStorage (pour synchroniser)
        this.loadLikesFromStorage();
        this.loadFavoritesFromStorage();
      },
      error: (err) => {
        console.warn('⚠️ API non disponible, fallback vers localStorage');
        this.loadSuggestionsFromLocalStorage();
      }
    });
  }

  loadSuggestionsFromLocalStorage(): void {
    const defaultSuggestions = this.suggestionService.getSuggestionsList();
    this.suggestions = [...defaultSuggestions];

    if (this.isBrowser) {
      const savedSuggestions = localStorage.getItem('all_suggestions');
      if (savedSuggestions) {
        try {
          const userSuggestions = JSON.parse(savedSuggestions);
          this.suggestions = [...this.suggestions, ...userSuggestions];
          console.log('📦 Suggestions depuis localStorage:', this.suggestions.length);
        } catch (error) {
          console.error('❌ Erreur localStorage:', error);
        }
      }
    }

    this.loadLikesFromStorage();
    this.loadFavoritesFromStorage();
  }

  // ✅ CHARGER LES LIKES DEPUIS LOCALSTORAGE
  loadLikesFromStorage(): void {
    if (!this.isBrowser) return;

    const savedLikes = localStorage.getItem('suggestion_likes');
    if (savedLikes) {
      try {
        const likesData = JSON.parse(savedLikes);
        
        // Appliquer les likes à chaque suggestion
        this.suggestions.forEach(suggestion => {
          if (likesData[suggestion.id] !== undefined) {
            suggestion.nbLikes = likesData[suggestion.id];
          }
        });
        
        console.log('👍 Likes chargés depuis localStorage');
      } catch (error) {
        console.error('❌ Erreur chargement likes:', error);
      }
    }
  }

  // ✅ SAUVEGARDER LES LIKES DANS LOCALSTORAGE
  saveLikesToStorage(): void {
    if (!this.isBrowser) return;

    const likesData: { [key: number]: number } = {};
    
    this.suggestions.forEach(suggestion => {
      likesData[suggestion.id] = suggestion.nbLikes;
    });
    
    localStorage.setItem('suggestion_likes', JSON.stringify(likesData));
    console.log('💾 Likes sauvegardés dans localStorage');
  }

  loadFavoritesFromStorage(): void {
    if (!this.isBrowser) return;

    const savedFavorites = localStorage.getItem('suggestion_favorites');
    if (savedFavorites) {
      try {
        const favoriteIds: number[] = JSON.parse(savedFavorites);
        this.favorites = this.suggestions.filter(s => favoriteIds.includes(s.id));
        console.log('⭐ Favoris chargés:', this.favorites.length);
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

  get filteredSuggestions(): Suggestion[] {
    let result = this.showFavoritesView ? [...this.favorites] : [...this.suggestions];

    if (this.currentFilter !== 'all' && !this.showFavoritesView) {
      result = result.filter(s => s.status === this.currentFilter);
    }

    if (this.searchText && this.searchText.trim()) {
      const searchLower = this.searchText.toLowerCase().trim();
      result = result.filter(s => 
        s.title.toLowerCase().includes(searchLower) ||
        s.category.toLowerCase().includes(searchLower) ||
        s.description.toLowerCase().includes(searchLower)
      );
    }

    return result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
  }

  // ✅ INCRÉMENTER LES LIKES (API + localStorage)
  incrementLikes(suggestion: Suggestion): void {
    const newLikes = suggestion.nbLikes + 1;
    
    // Essayer de mettre à jour via API
    this.suggestionService.updateLikes(suggestion.id, newLikes).subscribe({
      next: (updatedSuggestion) => {
        // Mise à jour réussie via API
        suggestion.nbLikes = updatedSuggestion.nbLikes;
        console.log('👍 Like ajouté via API:', suggestion.title);
        
        // Sauvegarder aussi dans localStorage pour synchronisation
        this.saveLikesToStorage();
      },
      error: (err) => {
        console.warn('⚠️ API non disponible, like enregistré localement');
        
        // Incrémenter localement
        suggestion.nbLikes++;
        
        // Sauvegarder dans localStorage
        this.saveLikesToStorage();
      }
    });
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
    console.log('⭐ Retiré des favoris:', suggestion.title);
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

  deleteSuggestion(suggestion: Suggestion): void {
    const confirmDelete = confirm(`Êtes-vous sûr de vouloir supprimer la suggestion "${suggestion.title}" ?`);
    
    if (confirmDelete) {
      this.suggestionService.deleteSuggestion(suggestion.id).subscribe({
        next: () => {
          this.suggestions = this.suggestions.filter(s => s.id !== suggestion.id);
          this.favorites = this.favorites.filter(f => f.id !== suggestion.id);
          this.saveFavoritesToStorage();
          this.saveLikesToStorage();
          
          console.log('✅ Suggestion supprimée via API');
          alert('✅ Suggestion supprimée avec succès !');
        },
        error: (err) => {
          console.error('❌ Erreur suppression API:', err);
          
          this.suggestions = this.suggestions.filter(s => s.id !== suggestion.id);
          this.favorites = this.favorites.filter(f => f.id !== suggestion.id);
          
          if (this.isBrowser) {
            const userSuggestions = this.suggestions.filter(s => s.id > 6);
            localStorage.setItem('all_suggestions', JSON.stringify(userSuggestions));
            this.saveFavoritesToStorage();
            this.saveLikesToStorage();
          }
          
          alert('⚠️ Suppression locale uniquement (API non disponible)');
        }
      });
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