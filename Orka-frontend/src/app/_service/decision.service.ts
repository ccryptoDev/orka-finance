import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DecisionService {
  private decisionSource = new BehaviorSubject<string>('');
  public decisionSource$ = this.decisionSource.asObservable();

  public setDecision(decision: string) {
    this.decisionSource.next(decision);
  }
}
