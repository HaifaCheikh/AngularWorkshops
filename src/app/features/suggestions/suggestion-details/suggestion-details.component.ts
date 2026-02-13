import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Suggestion } from '../../../models/suggestion';

@Component({
  selector: 'app-suggestion-details',
  templateUrl: './suggestion-details.component.html',
  styleUrls: ['./suggestion-details.component.css']
})
export class SuggestionDetailsComponent implements OnInit {
  suggestionId: number = 0;
  suggestion: Suggestion | undefined;
  private isBrowser: boolean;

  // Suggestions par défaut (même liste que dans list-suggestion)
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

  allSuggestions: Suggestion[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    // Récupérer l'ID depuis l'URL
    this.route.params.subscribe(params => {
      this.suggestionId = +params['id']; // Le + convertit string en number
      console.log('📌 ID récupéré:', this.suggestionId);
      this.loadSuggestion();
    });
  }

  loadSuggestion(): void {
    // Charger toutes les suggestions (par défaut + localStorage)
    this.allSuggestions = [...this.defaultSuggestions];

    if (this.isBrowser) {
      const savedSuggestions = localStorage.getItem('all_suggestions');
      if (savedSuggestions) {
        try {
          const userSuggestions = JSON.parse(savedSuggestions);
          this.allSuggestions = [...this.allSuggestions, ...userSuggestions];
        } catch (error) {
          console.error('Erreur chargement suggestions:', error);
        }
      }
    }

    // Trouver la suggestion correspondant à l'ID
    this.suggestion = this.allSuggestions.find(s => s.id === this.suggestionId);

    if (!this.suggestion) {
      console.error('❌ Suggestion non trouvée avec ID:', this.suggestionId);
    } else {
      console.log('✅ Suggestion trouvée:', this.suggestion.title);
    }
  }

  // Retour à la liste
  backToList(): void {
    this.router.navigate(['/suggestions']);
  }

  // Obtenir l'icône de catégorie
  getCategoryIcon(category: string): string {
    switch (category?.toLowerCase()) {
      case 'technologie': return '💻';
      case 'événements': return '🎉';
      case 'ressources humaines': return '👥';
      case 'marketing': return '📢';
      case 'finance': return '💰';
      default: return '📌';
    }
  }

  // Obtenir le badge de statut
  getStatusBadge(status: string): string {
    switch (status) {
      case 'acceptee': return '✅ Acceptée';
      case 'en_attente': return '⏳ En attente';
      case 'refusee': return '❌ Refusée';
      default: return '📌 Statut inconnu';
    }
  }
}