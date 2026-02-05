import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  @Output() viewChange = new EventEmitter<string>();

  changeView(view: string): void {
    this.viewChange.emit(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}