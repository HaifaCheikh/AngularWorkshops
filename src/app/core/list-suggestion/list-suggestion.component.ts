import { Component, OnInit } from '@angular/core';
import { Suggestion } from '../../models/suggestion';

@Component({
  selector: 'app-list-suggestion',
  templateUrl: './list-suggestion.component.html',
  styleUrls: ['./list-suggestion.component.css']
})
export class ListSuggestionComponent implements OnInit {
  searchText: string = '';
  favorites: Suggestion[] = [];
  currentFilter: string = 'all';
  sortBy: string = 'date';
  viewMode: string = 'grid'; // 'grid' ou 'list'
  
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
    // Initialisation
  }

  // Filtrer les suggestions selon la recherche et le filtre actif
  get filteredSuggestions(): Suggestion[] {
    let result = [...this.suggestions];

    // Appliquer le filtre de statut
    if (this.currentFilter !== 'all') {
      result = result.filter(s => s.status === this.currentFilter);
    }

    // Appliquer la recherche par texte
    if (this.searchText) {
      const searchLower = this.searchText.toLowerCase();
      result = result.filter(s => 
        s.title.toLowerCase().includes(searchLower) ||
        s.category.toLowerCase().includes(searchLower) ||
        s.description.toLowerCase().includes(searchLower)
      );
    }

    // Appliquer le tri
    result = this.sortSuggestions(result);

    return result;
  }

  // Trier les suggestions
  sortSuggestions(suggestions: Suggestion[]): Suggestion[] {
    switch (this.sortBy) {
      case 'date':
        return suggestions.sort((a, b) => b.date.getTime() - a.date.getTime());
      case 'likes':
        return suggestions.sort((a, b) => b.nbLikes - a.nbLikes);
      case 'title':
        return suggestions.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return suggestions;
    }
  }

  // Incrémenter les likes avec animation
  incrementLikes(suggestion: Suggestion): void {
    suggestion.nbLikes++;
    // Animation visuelle gérer dans le CSS avec une classe temporaire
  }

  // Ajouter aux favoris
  addToFavorites(suggestion: Suggestion): void {
    if (!this.favorites.find(f => f.id === suggestion.id)) {
      this.favorites.push(suggestion);
    }
  }

  // Retirer des favoris
  removeFromFavorites(suggestion: Suggestion): void {
    this.favorites = this.favorites.filter(f => f.id !== suggestion.id);
  }

  // Vérifier si une suggestion est dans les favoris
  isInFavorites(id: number): boolean {
    return this.favorites.some(f => f.id === id);
  }

  // Basculer favori
  toggleFavorite(suggestion: Suggestion): void {
    if (this.isInFavorites(suggestion.id)) {
      this.removeFromFavorites(suggestion);
    } else {
      this.addToFavorites(suggestion);
    }
  }

  // Définir le filtre actif
  setFilter(filter: string): void {
    this.currentFilter = filter;
  }

  // Définir le tri
  setSortBy(sortBy: string): void {
    this.sortBy = sortBy;
  }

  // Changer le mode d'affichage
  setViewMode(mode: string): void {
    this.viewMode = mode;
  }

  // Compter les suggestions acceptées
  getAcceptedCount(): number {
    return this.suggestions.filter(s => s.status === 'acceptee').length;
  }

  // Compter les suggestions en attente
  getPendingCount(): number {
    return this.suggestions.filter(s => s.status === 'en_attente').length;
  }

  // Compter les suggestions refusées
  getRejectedCount(): number {
    return this.suggestions.filter(s => s.status === 'refusee').length;
  }

  // Obtenir le total des likes
  getTotalLikes(): number {
    return this.suggestions.reduce((sum, s) => sum + s.nbLikes, 0);
  }

  // Obtenir la couleur du statut
  getStatusColor(status: string): string {
    switch (status) {
      case 'acceptee': return '#10b981';
      case 'en_attente': return '#f59e0b';
      case 'refusee': return '#ef4444';
      default: return '#64748b';
    }
  }

  // Obtenir le label du statut
  getStatusLabel(status: string): string {
    switch (status) {
      case 'acceptee': return 'Acceptée';
      case 'en_attente': return 'En attente';
      case 'refusee': return 'Refusée';
      default: return status;
    }
  }

  // Obtenir l'icône de la catégorie
  getCategoryIcon(category: string): string {
    switch (category.toLowerCase()) {
      case 'technologie': return '💻';
      case 'événements': return '🎉';
      case 'ressources humaines': return '👥';
      default: return '📌';
    }
  }
}