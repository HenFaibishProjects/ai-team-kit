import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-raci',
  templateUrl: './raci.component.html',
  styleUrls: ['./raci.component.css'],
  standalone: false
})
export class RaciComponent {
  @Output() complete = new EventEmitter<void>();
}
