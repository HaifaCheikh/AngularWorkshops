import { Component, ViewChild } from '@angular/core';
import { ListSuggestionComponent } from './core/list-suggestion/list-suggestion.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'newProject';
  currentView: string = 'dashboard';

  @ViewChild(ListSuggestionComponent) listSuggestionComponent!: ListSuggestionComponent;

  onViewChange(view: string): void {
    this.currentView = view;
    console.log('Vue changée:', view);

    // Si c'est la vue favoris, activer l'affichage des favoris
    if (view === 'favorites' && this.listSuggestionComponent) {
      setTimeout(() => {
        this.listSuggestionComponent.showFavoritesOnly();
      }, 100);
    }
  }
}