import { Component } from '@angular/core';
import { BehaviorSubject, interval, Observable, of } from 'rxjs';
import { map, withLatestFrom, exhaustMap } from 'rxjs/operators';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  public sourceInterval = interval(1000).pipe(map((data) => `Source: ${data}`));

  public mySemaphore = new BehaviorSubject(false);

  private _observableBuffer;

  constructor() {
    // option 1: use exhaustMap
    this.sourceInterval
      .pipe(
        withLatestFrom(this.mySemaphore),
        exhaustMap(([sourceIntervalEmission, semaphoreEmission]) =>
          semaphoreEmission
            ? new Observable<void>((subscriber) => {
                console.log('Panel is opening...');
                this._observableBuffer = subscriber;
              })
            : of(sourceIntervalEmission)
        )
      )
      .subscribe(console.log);

    // Option 2: use filter
    // this.sourceInterval
    //   .pipe(
    //     withLatestFrom(this.mySemaphore),
    //     filter(([, semaphoreEmission]) => !semaphoreEmission),
    //     map(([value]) => value)
    //   )
    //   .subscribe(console.log);
  }

  public interruptEpic() {
    this.mySemaphore.next(true);
  }

  public continueEpic() {
    this.mySemaphore.next(false);
    this._observableBuffer.complete();
  }
}
