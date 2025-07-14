import { Injectable, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class QuizSignalRService {
  private hubConnection!: signalR.HubConnection;

  public startConnection(): Promise<any> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5038/quizhub', {
        withCredentials: true // 👈 allows cookies and CORS
      })
      .withAutomaticReconnect()
      .build();

    return this.hubConnection
      .start()
      .then(() => console.log('SignalR Connected'))
      .catch(err => console.error('SignalR Connection Error:', err));
  }

  public onReceiveNewQuiz(callback: (category: string, title: string) => void): void {
    this.hubConnection.on('ReceiveNewQuiz', callback);
  }
}
