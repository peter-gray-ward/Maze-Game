import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { IBook } from '../../models/book';

export interface Library {
	[key: string]: IBook[]
};

interface BookResponse {
	count: number;
	next: string|null;
	previous: string|null;
	results: IBook[];
}

interface TopicResponse {
	topic: string;
	results: IBook[];
}

@Injectable({
	providedIn: "root"
})
export class LibraryService {
	private pageRange: number[] = [1, 2350];
	private topics: string[] = [
		'fantasy', 'sci-fi', 'philosophy', 'art', 'technology',
		'horror', 'psychology', 'neuroscience', 'science', 'nature', 
		'mythology', 'folklore','music', 'theology'];
	private library: {
		[key: string]: IBook[]
	} = {};
	private readonly isLocal: boolean = true;
	private readonly HOST = "https://gutendex.com/books";
	private readonly LOCAL_HOST = "/library.json";
	private librarySubject = new BehaviorSubject<Library>({});
	public library$ = this.librarySubject.asObservable();

	constructor(private http: HttpClient) {
		if (this.isLocal) {
			this.getLocalLibrary();
		} else {
			let topics = [];
			for (let topic of this.topics) {
				topics.push(this.getTopicPromise(topic));
			}
			Promise.all(topics).then(topics => {
				for (let r of topics) {
					this.library[r.topic] = r.results;
				}
			});
		}
	}

	getTopicPromise(topic: string): Promise<TopicResponse> {
		return new Promise(resolve => {
			this.http
				.get<any>(`${this.HOST}/?topic=${topic}`)
				.subscribe((res: BookResponse) => {
					resolve({ topic, results: res.results });
				});
		});
	}

	getLocalLibrary() {
		this.http
			.get<any>(`${this.LOCAL_HOST}`)
			.subscribe((lib: Library) => {
				this.librarySubject.next(lib);
			});
	}

	static shuffle(books: IBook[]) {
		let result: IBook[] = [];
		while (books.length) {
			var index = Math.floor(Math.random() * books.length);
			result.push(books[index] as IBook);
			books.splice(index, 1);
		}
		return result;
	}

	static libraryStack(lib: Library): IBook[] {
		return LibraryService.shuffle(Object.keys(lib).map(topic => lib[topic]).flat());
	}

}