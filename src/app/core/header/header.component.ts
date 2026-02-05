import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Output() viewChange = new EventEmitter<string>();
  currentView: string = 'dashboard';

  changeView(view: string): void {
    this.currentView = view;
    this.viewChange.emit(view);
  }
}