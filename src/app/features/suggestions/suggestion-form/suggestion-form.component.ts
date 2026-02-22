import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Suggestion } from '../../../models/suggestion';

@Component({
  selector: 'app-suggestion-form',
  templateUrl: './suggestion-form.component.html',
  styleUrls: ['./suggestion-form.component.css']
})
export class SuggestionFormComponent implements OnInit {
  suggestionForm!: FormGroup;
  
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
    private router: Router
  ) {}

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

  // Getters pour faciliter l'accès aux contrôles dans le template
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
      // Créer la nouvelle suggestion
      const newSuggestion: Suggestion = {
        id: Date.now(), // ID auto-généré basé sur timestamp
        title: this.suggestionForm.value.title,
        description: this.suggestionForm.value.description,
        category: this.suggestionForm.value.category,
        date: new Date(),
        status: 'en_attente',
        nbLikes: 0 // Par défaut 0
      };

      console.log('✅ Nouvelle suggestion:', newSuggestion);

      // Récupérer les suggestions existantes
      const existingSuggestions = localStorage.getItem('all_suggestions');
      let suggestions: Suggestion[] = existingSuggestions 
        ? JSON.parse(existingSuggestions) 
        : [];

      // Ajouter la nouvelle suggestion
      suggestions.push(newSuggestion);

      // Sauvegarder dans localStorage
      localStorage.setItem('all_suggestions', JSON.stringify(suggestions));

      console.log('💾 Suggestion sauvegardée dans localStorage');

      // Redirection vers la liste des suggestions
      this.router.navigate(['/suggestions']);
    }
  }

  onCancel(): void {
    this.router.navigate(['/suggestions']);
  }
}