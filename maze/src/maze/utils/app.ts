export const host = "http://localhost:5149";
interface XhrOptions {
	method: string;
	url: string;
	body?: XMLHttpRequestBodyInit;
}
export const xhr = (options: XhrOptions): Promise<any> => {
	return new Promise((resolve: any) => {
		var x = new XMLHttpRequest();
		x.open(options.method, options.url);
		x.addEventListener('load', (res: any) => {
			resolve(res);
		});
		if (options.method == 'POST' || options.method == 'PUT') {
			x.send(options.body || null);
		} else {
			x.send();
		}
	});
}