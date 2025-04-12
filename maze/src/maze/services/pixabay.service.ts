import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { host } from '../utils/app';
import { xhr } from '../utils/app';
import { PixabayResponse, PixabayHit } from '../constants/index';

@Injectable({
  providedIn: 'root'
})
export default class Pixabay {
  private key: string = "";
  private url: string = "https://pixabay.com/api";
  constructor(private http: HttpClient) {
    console.log("[Constructing] Pixabay");

    xhr({ method: 'GET', url: `${host}/key/pixabay`}).then((res: any) => {
      console.log('...', res, res.target.response)
      this.key = res.target.response;
    });
  }

  get(q: string): Promise<string> {
    if (q.length > 100) {
      q = q.split('').slice(100).join('');
    }
    return new Promise((resolve: any) => {
      xhr({ method: 'GET', url: `${this.url}/?key=${this.key}&q=${q}`}).then((res: any) => {
        console.log("----", res)
        res = JSON.parse(res.target.response);
        console.log("++++", res)
        let result = res.hits[0];
        let i = 0;
        while (i < res.total - 1 && !result.largeImageURL) {
          i++;
          result = res.hits[i];
        }
        resolve(result.largeImageURL);
      });
    })
  }
}