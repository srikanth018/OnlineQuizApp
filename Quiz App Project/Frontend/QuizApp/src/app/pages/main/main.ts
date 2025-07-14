import { Component } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Sidebar } from '../../components/sidebar/sidebar';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main',
  imports: [Navbar, Sidebar, RouterOutlet],
  templateUrl: './main.html',
  styleUrl: './main.css'
})
export class Main {

}
