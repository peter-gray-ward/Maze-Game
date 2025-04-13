import { Injectable } from '@angular/core';
import { host } from '../utils/app';
import { xhr } from '../utils/app';
import { PixabayResponse, PixabayHit } from '../constants/index';

@Injectable({
  providedIn: 'root'
})
export default class Pixabay {
  private key: string = "";
  private url: string = "https://pixabay.com/api";
  private data: Map<string, string> = new Map();
  constructor() {
    console.log("[Constructing] Pixabay");

    xhr({ method: 'GET', url: `${host}/key/pixabay`}).then((res: any) => {
      console.log('...', res, res.target.response)
      this.key = res.target.response;
    });
  }

  get(q: string): Promise<string> {
    if (this.data.has(q)) {
      return new Promise((resolve: any) => {
        resolve(this.data.get(q));
      });
    }
    if (q.length > 100) {
      q = q.split('').slice(100).join('')
        .split(' ')
        .join('+')
    }
    return new Promise((resolve: any) => {
      xhr({ method: 'GET', url: `${this.url}/?key=${this.key}&q=${q}`}).then((res: any) => {
        res = JSON.parse(res.target.response);
        let result = res.hits[res.hits.length > 11 ? 11 : 0];
        let i = 0;
        while (i < res.total - 1 && !result.largeImageURL) {
          i++;
          result = res.hits[i];
        }
        if (result.largeImageURL === undefined) {
          result = { largeImageURL: "/wallpaper.webp" };
        } else {
          this.data.set(q, result.largeImageURL);
        }
        
        resolve(result.largeImageURL);
      });
    })
  }
}