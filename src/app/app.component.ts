import { Component, OnDestroy } from '@angular/core';
import {Observable, interval, Subscription, timer, fromEvent} from 'rxjs';
import {map, take, repeat, takeUntil, bufferWhen, debounceTime} from 'rxjs/operators';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy{
  
  title = 'Timer';
  Hours:string = '00';
  Minutes:string = '00';
  Seconds:Observable<string>;

  timerStartValue:string = '00';
  secondsValue:string = '00';
  secondsPausedValue:string = '00';

  secondsCounter:Observable<number>;
  secondsCounterSubscription:Subscription;

  timerStarted:boolean;
  //wait
  waitTime:number = 300;


  constructor(){
    this.secondsCounter = timer(1,1000);
  }

  ngOnDestroy(): void {
    this.Seconds = null;
    this.secondsCounterSubscription.unsubscribe();
  }

  funcTen(value:number|string):string{
    let res:string;
    if(typeof value === 'number'){
      res = value<10?'0'+value:''+value;
    }else{
      let parsedValue:number = parseInt(value);
      res = parsedValue<10?'0'+parsedValue:''+parsedValue;
    }
    return res;
  }

  funcTimerOnOff():void {
    if(this.timerStarted){
      this.funcStop();  
    } else{
      this.funcStart();
    }
  }

  funcWait(evt):void{
    const waitButtonObs = fromEvent(document.getElementsByClassName('buttonControl')[1],'click');
    waitButtonObs.pipe(
      bufferWhen(()=>waitButtonObs.pipe(debounceTime(300))),
      map(list => {
        if(list.length > 1){
          try{
          this.funcStop();
          }catch(err){console.warn('start timer before clicking :)');}
          return 'stopped at '+list.map(cur => new Date(cur.timeStamp).getSeconds().toString() +'s'+ new Date(cur.timeStamp).getMilliseconds().toString()+'ms');
        }else{
          try{
            this.funcStart();
          }catch(err){console.warn('start timer before clicking :)');}
          return 'clicks not in range';
        }
      })
    )
    .subscribe(data => {
      console.log(data);
    });
  }

  funcStart():void{
    try{
      this.secondsCounterSubscription.unsubscribe();
    }
    catch(err){}
      this.timerStarted = true;
      this.Seconds = this.secondsCounter
      .pipe(map((i:number,index:number)=>{
        let deltaPart:number;
        if(i+parseInt(this.secondsPausedValue) >= 60){
          deltaPart = i+parseInt(this.secondsPausedValue)-60;
        }else{
          deltaPart = i + parseInt(this.secondsPausedValue);
        }
        return this.funcTen(deltaPart);
      }))
      .pipe(take(59))
      .pipe(repeat(10));
    
    this.secondsCounterSubscription = this.Seconds.subscribe(data => {
      let deltaPart = parseInt(data);
        if(deltaPart === 0 && parseInt(this.secondsValue) === 59){
          if(parseInt(this.Minutes) + 1 < 60){
            this.Minutes = this.funcTen(parseInt(this.Minutes) + 1);
          }else{
            this.Minutes = this.timerStartValue;
            this.Hours = this.funcTen(parseInt(this.Hours) + 1);
          }
        }else{
          this.secondsValue = this.funcTen(deltaPart);
        }
        //test output
        console.log('cached on return',this.secondsValue, 'paused ', this.secondsPausedValue);
        return this.secondsValue;
      });    
  }

  funcStop():void{
    console.log('seconds cached',this.secondsValue);
    this.timerStarted = false;
    this.secondsPausedValue = this.secondsValue;
    this.Seconds = null;
    this.secondsCounterSubscription.unsubscribe();
  }

  funcReset():void{
    this.Hours = this.timerStartValue;
    this.Minutes = this.timerStartValue;
    this.secondsValue = this.timerStartValue;
    this.secondsPausedValue = this.timerStartValue;
    this.Seconds = null;
    this.secondsCounter = timer(1,1000);//interval(1000);
    this.secondsCounterSubscription.unsubscribe();
  }
}
