import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Suggestion } from '../../../models/suggestion';
import { SuggestionService } from '../../../core/services/suggestion.service';

@Component({
  selector: 'app-suggestion-edit',
  templateUrl: './suggestion-edit.component.html',
  styleUrls: ['./suggestion-edit.component.css']
})
export class SuggestionEditComponent implements OnInit {
  suggestionForm!: FormGroup;
  suggestionId!: number;
  currentSuggestion: Suggestion | undefined;
  private isBrowser: boolean;
  
  categories: string[] = [
    'Infrastructure et bâtiments',
    'Technologie et services numériques',
    'Restauration et cafétéria',
    'Hygiène et environnement',
    'Transport et mobilité',
    'Activités et événements',
    'Sécurité',
    'Communication interne',
    'Accessibilité',
    'Autre'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private suggestionService: SuggestionService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.initForm();
    this.suggestionId = +this.route.snapshot.params['id'];
    console.log('📝 ID à modifier:', this.suggestionId);
    this.loadSuggestion();
  }

  initForm(): void {
    this.suggestionForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.pattern('^[A-Z][a-zA-Z ]*$')]],
      description: ['', [Validators.required, Validators.minLength(30)]],
      category: ['', Validators.required],
      date: [{ value: '', disabled: true }],
      status: [{ value: '', disabled: true }]
    });
  }

  loadSuggestion(): void {
    this.suggestionService.getSuggestionById(this.suggestionId).subscribe({
      next: (data: Suggestion) => {
        this.currentSuggestion = data;
        this.patchForm(data);
        console.log('✅ Suggestion chargée via API');
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

    this.currentSuggestion = allSuggestions.find(s => s.id === this.suggestionId);
    
    if (this.currentSuggestion) {
      this.patchForm(this.currentSuggestion);
      console.log('✅ Suggestion chargée depuis localStorage');
    } else {
      alert('Suggestion introuvable !');
      this.router.navigate(['/suggestions']);
    }
  }

  patchForm(suggestion: Suggestion): void {
    this.suggestionForm.patchValue({
      title: suggestion.title,
      description: suggestion.description,
      category: suggestion.category,
      date: new Date(suggestion.date).toISOString().split('T')[0],
      status: this.getStatusLabel(suggestion.status)
    });
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'acceptee': return 'Acceptée';
      case 'en_attente': return 'En attente';
      case 'refusee': return 'Refusée';
      default: return status;
    }
  }

  get title() {
    return this.suggestionForm.get('title');
  }

  get description() {
    return this.suggestionForm.get('description');
  }

  get category() {
    return this.suggestionForm.get('category');
  }

  onSubmit(): void {
    if (this.suggestionForm.valid && this.currentSuggestion) {
      const updatedSuggestion: Suggestion = {
        ...this.currentSuggestion,
        title: this.suggestionForm.value.title,
        description: this.suggestionForm.value.description,
        category: this.suggestionForm.value.category
      };

      console.log('📤 Mise à jour via API...');

      this.suggestionService.updateSuggestion(this.suggestionId, updatedSuggestion).subscribe({
        next: (response) => {
          console.log('✅ Suggestion mise à jour via API');
          alert('✅ Suggestion modifiée avec succès !');
          this.router.navigate(['/suggestions']);
        },
        error: (err) => {
          console.error('❌ Erreur API:', err);
          console.log('⚠️ Fallback : Mise à jour dans localStorage');
          this.updateSuggestionInLocalStorage(updatedSuggestion);
        }
      });
    }
  }

  updateSuggestionInLocalStorage(updatedSuggestion: Suggestion): void {
    if (!this.isBrowser) return;

    const saved = localStorage.getItem('all_suggestions');
    if (saved) {
      let suggestions = JSON.parse(saved);
      const index = suggestions.findIndex((s: Suggestion) => s.id === this.suggestionId);
      
      if (index !== -1) {
        suggestions[index] = updatedSuggestion;
        localStorage.setItem('all_suggestions', JSON.stringify(suggestions));
        console.log('💾 Suggestion mise à jour dans localStorage');
        alert('⚠️ Modification locale uniquement (API non disponible)');
        this.router.navigate(['/suggestions']);
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/suggestions']);
  }
}