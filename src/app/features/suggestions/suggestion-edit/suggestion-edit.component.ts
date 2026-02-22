import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Suggestion } from '../../../models/suggestion';

@Component({
  selector: 'app-suggestion-edit',
  templateUrl: './suggestion-edit.component.html',
  styleUrls: ['./suggestion-edit.component.css']
})
export class SuggestionEditComponent implements OnInit {
  suggestionForm!: FormGroup;
  suggestionId!: number;
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

  // Suggestions par défaut
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
  currentSuggestion: Suggestion | undefined;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.initForm();
    this.loadSuggestion();
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
      date: [{ value: '', disabled: true }],
      status: [{ value: '', disabled: true }]
    });
  }

  loadSuggestion(): void {
    // Récupérer l'ID depuis l'URL
    this.route.params.subscribe(params => {
      this.suggestionId = +params['id'];
      console.log('📝 ID à modifier:', this.suggestionId);
      
      // Charger toutes les suggestions
      this.loadAllSuggestions();
      
      // Trouver la suggestion à modifier
      this.currentSuggestion = this.allSuggestions.find(s => s.id === this.suggestionId);
      
      if (this.currentSuggestion) {
        // Pré-remplir le formulaire
        this.suggestionForm.patchValue({
          title: this.currentSuggestion.title,
          description: this.currentSuggestion.description,
          category: this.currentSuggestion.category,
          date: new Date(this.currentSuggestion.date).toISOString().split('T')[0],
          status: this.getStatusLabel(this.currentSuggestion.status)
        });
        console.log('✅ Formulaire pré-rempli');
      } else {
        console.error('❌ Suggestion non trouvée');
        alert('Suggestion introuvable !');
        this.router.navigate(['/suggestions']);
      }
    });
  }

  loadAllSuggestions(): void {
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
      // Mettre à jour la suggestion
      this.currentSuggestion.title = this.suggestionForm.value.title;
      this.currentSuggestion.description = this.suggestionForm.value.description;
      this.currentSuggestion.category = this.suggestionForm.value.category;

      console.log('✅ Suggestion modifiée:', this.currentSuggestion);

      // Sauvegarder dans localStorage
      if (this.isBrowser) {
        // Séparer les suggestions par défaut et utilisateur
        const userSuggestions = this.allSuggestions.filter(s => s.id > 6);
        localStorage.setItem('all_suggestions', JSON.stringify(userSuggestions));
        console.log('💾 Modifications sauvegardées');
      }

      // Redirection
      alert('✅ Suggestion modifiée avec succès !');
      this.router.navigate(['/suggestions']);
    }
  }

  onCancel(): void {
    this.router.navigate(['/suggestions']);
  }
}