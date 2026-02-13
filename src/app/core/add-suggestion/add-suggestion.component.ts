import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-suggestion',
  templateUrl: './add-suggestion.component.html',
  styleUrls: ['./add-suggestion.component.css']
})
export class AddSuggestionComponent {
  showSuccessMessage: boolean = false;

  newSuggestion = {
    title: '',
    description: '',
    category: ''
  };

  constructor(private router: Router) {}

  onSubmit(): void {
    // Créer l'objet suggestion complet
    const suggestion = {
      id: Date.now(), // ID unique basé sur le timestamp
      title: this.newSuggestion.title,
      description: this.newSuggestion.description,
      category: this.newSuggestion.category,
      date: new Date(),
      status: 'en_attente', // Par défaut en attente
      nbLikes: 0
    };

    // Récupérer les suggestions existantes du localStorage
    const existingSuggestions = localStorage.getItem('all_suggestions');
    let suggestions = existingSuggestions ? JSON.parse(existingSuggestions) : [];

    // Ajouter la nouvelle suggestion
    suggestions.push(suggestion);

    // Sauvegarder dans localStorage
    localStorage.setItem('all_suggestions', JSON.stringify(suggestions));

    // Afficher le message de succès
    this.showSuccessMessage = true;

    // Réinitialiser le formulaire
    this.newSuggestion = {
      title: '',
      description: '',
      category: ''
    };

    // Rediriger vers la liste après 2 secondes
    setTimeout(() => {
      this.router.navigate(['/listSuggestion']);
    }, 2000);
  }
}