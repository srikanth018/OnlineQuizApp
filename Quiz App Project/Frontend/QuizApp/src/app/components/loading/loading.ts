import { Component } from "@angular/core";
import { LottieComponent } from 'ngx-lottie';
import animationData from '../../../assets/Animation-1750747173959.json';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [LottieComponent],
  templateUrl: './loading.html',
  styleUrls: ['./loading.css']
})
export class Loading {
  options = {
    animationData, 
    loop: true,
    autoplay: true,
  };
}
