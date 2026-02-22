import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './core/home/home.component';
import { NotfoundComponent } from './core/notfound/notfound.component';

const routes: Routes = [
  // Route par défaut
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  
  // Routes normales
  { path: 'home', component: HomeComponent },
  
  // Redirection pour compatibilité
  { path: 'add-suggestion', redirectTo: '/suggestions/add', pathMatch: 'full' },
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