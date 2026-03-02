import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Suggestion } from '../../../models/suggestion';
import { SuggestionService } from '../../../core/services/suggestion.service';

@Component({
  selector: 'app-suggestion-details',
  templateUrl: './suggestion-details.component.html',
  styleUrls: ['./suggestion-details.component.css']
})
export class SuggestionDetailsComponent implements OnInit {
  suggestionId: number = 0;
  suggestion: Suggestion | undefined;
  private isBrowser: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object,
    private suggestionService: SuggestionService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.suggestionId = +params['id'];
      console.log('📌 ID récupéré:', this.suggestionId);
      this.loadSuggestion();
    });
  }

  loadSuggestion(): void {
    this.suggestionService.getSuggestionById(this.suggestionId).subscribe({
      next: (data: Suggestion) => {
        // ✅ CORRECTION : Ajouter des valeurs par défaut si undefined
        this.suggestion = {
          ...data,
          nbLikes: data.nbLikes ?? 0,  // Si undefined ou null → 0
          status: data.status || 'en_attente',  // Si vide → 'en_attente'
          category: data.category || 'Autre'  // Si vide → 'Autre'
        };
        
        console.log('✅ Suggestion chargée via API');
        console.log('⚠️ Likes:', this.suggestion.nbLikes);
        console.log('⚠️ Status:', this.suggestion.status);
        
        // Charger les likes depuis localStorage (synchronisation)
        this.loadLikesForSuggestion();
      },
      error: (err) => {
        console.warn('⚠️ API non disponible, fallback localStorage');
        this.loadSuggestionFromLocalStorage();
      }
    });
  }

  loadSuggestionFromLocalStorage(): void {
    const allSuggestions = this.suggestionService.getSuggestionsList();
    
    if (this.isBrowser) {
      const saved = localStorage.getItem('all_suggestions');
      if (saved) {
        const userSuggestions = JSON.parse(saved);
        allSuggestions.push(...userSuggestions);
      }
    }

    const foundSuggestion = allSuggestions.find(s => s.id === this.suggestionId);
    
    if (foundSuggestion) {
      // ✅ CORRECTION : Ajouter des valeurs par défaut
      this.suggestion = {
        ...foundSuggestion,
        nbLikes: foundSuggestion.nbLikes ?? 0,
        status: foundSuggestion.status || 'en_attente',
        category: foundSuggestion.category || 'Autre'
      };
      
      this.loadLikesForSuggestion();
      console.log('✅ Suggestion chargée depuis localStorage');
    } else {
      alert('Suggestion introuvable !');
      this.router.navigate(['/suggestions']);
    }
  }

  loadLikesForSuggestion(): void {
    if (!this.isBrowser || !this.suggestion) return;

    const savedLikes = localStorage.getItem('suggestion_likes');
    if (savedLikes) {
      try {
        const likesData = JSON.parse(savedLikes);
        
        if (likesData[this.suggestion.id] !== undefined) {
          this.suggestion.nbLikes = likesData[this.suggestion.id];
          console.log('👍 Likes mis à jour depuis localStorage:', this.suggestion.nbLikes);
        }
      } catch (error) {
        console.error('❌ Erreur chargement likes:', error);
      }
    }
  }

  backToList(): void {
    this.router.navigate(['/suggestions']);
  }

  getCategoryIcon(category: string): string {
    if (!category) return '📌';
    
    switch (category.toLowerCase()) {
      case 'technologie': 
      case 'technologie et services numériques': 
        return '💻';
      case 'événements': 
      case 'activités et événements': 
        return '🎉';
      case 'ressources humaines': 
        return '👥';
      case 'marketing': 
        return '📢';
      case 'finance': 
        return '💰';
      case 'infrastructure et bâtiments':
        return '🏢';
      case 'restauration et cafétéria':
        return '🍽️';
      case 'hygiène et environnement':
        return '🌿';
      case 'transport et mobilité':
        return '🚗';
      case 'sécurité':
        return '🔒';
      case 'communication interne':
        return '📢';
      case 'accessibilité':
        return '♿';
      case 'autre':
        return '📌';
      default: 
        return '📌';
    }
  }

  getStatusBadge(status: string): string {
    if (!status) return '⏳ En attente';
    
    switch (status) {
      case 'acceptee': return '✅ Acceptée';
      case 'en_attente': return '⏳ En attente';
      case 'refusee': return '❌ Refusée';
      default: return '⏳ En attente';
    }
  }
  
  // ✅ GETTER pour éviter undefined dans le template
  get displayLikes(): number {
    return this.suggestion?.nbLikes ?? 0;
  }
  
  get displayStatus(): string {
    return this.getStatusBadge(this.suggestion?.status || 'en_attente');
  }
  
  get displayCategory(): string {
    return this.suggestion?.category || 'Autre';
  }
  
  get displayCategoryIcon(): string {
    return this.getCategoryIcon(this.suggestion?.category || '');
  }
}