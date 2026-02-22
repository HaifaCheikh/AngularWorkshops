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
  
  private isBrowser: boolean;
  
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

  suggestions: Suggestion[] = [];

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    console.log('🔄 Initialisation du composant...');
    this.loadAllSuggestions();
    this.loadLikesFromStorage();
    this.loadFavoritesFromStorage();
    console.log('✅ Suggestions chargées:', this.suggestions.length);
    console.log('📋 Liste des suggestions:', this.suggestions.map(s => `${s.id}: ${s.title}`));
  }

  loadAllSuggestions(): void {
    console.log('\n📦 Chargement des suggestions...');
    
    // Toujours commencer avec les suggestions par défaut
    this.suggestions = [...this.defaultSuggestions];
    console.log('✅ Suggestions par défaut:', this.suggestions.length);

    if (this.isBrowser) {
      const savedSuggestions = localStorage.getItem('all_suggestions');
      console.log('💾 localStorage brut:', savedSuggestions);
      
      if (savedSuggestions) {
        try {
          const userSuggestions = JSON.parse(savedSuggestions);
          console.log('📥 Suggestions utilisateur parsées:', userSuggestions.length);
          
          // Ajouter les suggestions utilisateur
          this.suggestions = [...this.suggestions, ...userSuggestions];
          console.log('✅ Total après fusion:', this.suggestions.length);
        } catch (error) {
          console.error('❌ Erreur chargement suggestions:', error);
        }
      } else {
        console.log('ℹ️ Aucune suggestion dans localStorage');
      }
    }
    
    console.log('📊 Suggestions finales:', this.suggestions.map(s => `ID ${s.id}: ${s.title} (${s.status})`));
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
        console.log('👍 Likes chargés');
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
    console.log('⭐ Affichage des favoris');
  }

  showAllSuggestions(): void {
    this.showFavoritesView = false;
    this.currentFilter = 'all';
    console.log('📋 Affichage de toutes les suggestions');
  }

  get filteredSuggestions(): Suggestion[] {
    console.log('\n🔍 Filtrage des suggestions...');
    console.log('📊 Suggestions disponibles:', this.suggestions.length);
    console.log('🎯 Filtre actuel:', this.currentFilter);
    console.log('⭐ Vue favoris:', this.showFavoritesView);
    console.log('🔎 Texte recherche:', this.searchText);
    
    let result = this.showFavoritesView ? [...this.favorites] : [...this.suggestions];
    console.log('📦 Après sélection favoris/tous:', result.length);

    // Filtre par statut
    if (this.currentFilter !== 'all' && !this.showFavoritesView) {
      console.log('🔍 Application du filtre statut:', this.currentFilter);
      result = result.filter(s => s.status === this.currentFilter);
      console.log('📊 Après filtre statut:', result.length);
    }

    // Recherche texte
    if (this.searchText && this.searchText.trim()) {
      const searchLower = this.searchText.toLowerCase().trim();
      console.log('🔍 Application de la recherche:', searchLower);
      result = result.filter(s => 
        s.title.toLowerCase().includes(searchLower) ||
        s.category.toLowerCase().includes(searchLower) ||
        s.description.toLowerCase().includes(searchLower)
      );
      console.log('📊 Après recherche:', result.length);
    }

    // Tri par date (plus récent en premier)
    result = result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });

    console.log('✅ Résultat final:', result.length, 'suggestions');
    console.log('📋 IDs filtrés:', result.map(s => s.id));
    return result;
  }

  incrementLikes(suggestion: Suggestion): void {
    suggestion.nbLikes++;
    this.saveLikesToStorage();
    console.log('👍 Like ajouté:', suggestion.title);
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
    console.log('🎯 Changement de filtre:', filter);
    this.currentFilter = filter;
    this.showFavoritesView = false;
  }

  deleteSuggestion(suggestion: Suggestion): void {
    const confirmDelete = confirm(`Êtes-vous sûr de vouloir supprimer la suggestion "${suggestion.title}" ?`);
    
    if (confirmDelete) {
      console.log('🗑️ Suppression de:', suggestion.title);
      
      // Supprimer la suggestion de la liste
      this.suggestions = this.suggestions.filter(s => s.id !== suggestion.id);
      
      // Supprimer des favoris si présente
      this.favorites = this.favorites.filter(f => f.id !== suggestion.id);
      
      // Sauvegarder dans localStorage (seulement les suggestions utilisateur)
      if (this.isBrowser) {
        const userSuggestions = this.suggestions.filter(s => s.id > 6);
        console.log('💾 Sauvegarde des suggestions utilisateur:', userSuggestions.length);
        localStorage.setItem('all_suggestions', JSON.stringify(userSuggestions));
        this.saveFavoritesToStorage();
        this.saveLikesToStorage();
      }
      
      console.log('✅ Suggestion supprimée avec succès');
      alert('✅ Suggestion supprimée avec succès !');
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