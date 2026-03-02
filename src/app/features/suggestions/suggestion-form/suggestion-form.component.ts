import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Suggestion } from '../../../models/suggestion';
import { SuggestionService } from '../../../core/services/suggestion.service';

@Component({
  selector: 'app-suggestion-form',
  templateUrl: './suggestion-form.component.html',
  styleUrls: ['./suggestion-form.component.css']
})
export class SuggestionFormComponent implements OnInit {
  suggestionForm!: FormGroup;
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
    private suggestionService: SuggestionService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.suggestionForm = this.fb.group({
      title: [
        '', 
        [
          Validators.required,
          Validators.minLength(5),
          Validators.pattern('^[A-Z][a-zA-Z ]*$')
        ]
      ],
      description: [
        '', 
        [
          Validators.required,
          Validators.minLength(30)
        ]
      ],
      category: ['', Validators.required],
      date: [{ value: new Date().toISOString().split('T')[0], disabled: true }],
      status: [{ value: 'en attente', disabled: true }]
    });
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
    if (this.suggestionForm.valid) {
      const newSuggestion: Suggestion = {
        id: 0,  // L'API générera l'ID
        title: this.suggestionForm.value.title,
        description: this.suggestionForm.value.description,
        category: this.suggestionForm.value.category,
        date: new Date(),
        status: 'en_attente',
        nbLikes: 0
      };

      console.log('📤 Envoi de la suggestion...');

      // Essayer d'ajouter via API
      this.suggestionService.addSuggestion(newSuggestion).subscribe({
        next: (response) => {
          console.log('✅ Suggestion ajoutée via API:', response);
          alert('✅ Suggestion ajoutée avec succès !');
          this.router.navigate(['/suggestions']);
        },
        error: (err) => {
          console.error('❌ Erreur API:', err);
          
          // Fallback : ajouter dans localStorage
          console.log('⚠️ Fallback : Sauvegarde dans localStorage');
          this.addSuggestionToLocalStorage(newSuggestion);
        }
      });
    }
  }

  // Fallback : Ajouter dans localStorage si API ne fonctionne pas
  addSuggestionToLocalStorage(suggestion: Suggestion): void {
    if (!this.isBrowser) return;

    // Générer un ID basé sur timestamp
    suggestion.id = Date.now();

    const existingSuggestions = localStorage.getItem('all_suggestions');
    let suggestions: Suggestion[] = existingSuggestions 
      ? JSON.parse(existingSuggestions) 
      : [];

    suggestions.push(suggestion);
    localStorage.setItem('all_suggestions', JSON.stringify(suggestions));

    console.log('💾 Suggestion sauvegardée dans localStorage');
    alert('⚠️ Suggestion ajoutée localement (API non disponible)');
    this.router.navigate(['/suggestions']);
  }

  onCancel(): void {
    this.router.navigate(['/suggestions']);
  }
}