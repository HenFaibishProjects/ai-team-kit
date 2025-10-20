import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-sprint-planning',
  templateUrl: './sprint-planning.component.html',
  styleUrls: ['./sprint-planning.component.css'],
  standalone: false
})
export class SprintPlanningComponent {
  @Output() complete = new EventEmitter<void>();
}
