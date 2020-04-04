export interface HistoryOptions {
	from?: string;
	to?: string;
}
export interface HistoryOptionsWithInterval extends HistoryOptions{
	interval?: number;
}
