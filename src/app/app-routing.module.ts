import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './core/home/home.component';
import { AddSuggestionComponent } from './core/add-suggestion/add-suggestion.component';
import { NotfoundComponent } from './core/notfound/notfound.component';

const routes: Routes = [
  // Route par défaut
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  
  // Routes normales
  { path: 'home', component: HomeComponent },
  { path: 'add-suggestion', component: AddSuggestionComponent },
  
  // REDIRECTION : /listSuggestion → /suggestions (pour compatibilité)
  { path: 'listSuggestion', redirectTo: '/suggestions', pathMatch: 'full' },
  
  // LAZY LOADING - Module Suggestions
  { 
    path: 'suggestions', 
    loadChildren: () => import('./features/suggestions/suggestions.module').then(m => m.SuggestionsModule)
  },
  
  // LAZY LOADING - Module Users
  { 
    path: 'users', 
    loadChildren: () => import('./features/users/users.module').then(m => m.UsersModule)
  },
  
  // Route 404
  { path: '**', component: NotfoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }