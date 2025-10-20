import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-adr',
  templateUrl: './adr.component.html',
  styleUrls: ['./adr.component.css'],
  standalone: false
})
export class AdrComponent {
  @Output() complete = new EventEmitter<void>();
}
