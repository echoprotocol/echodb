import { ok } from 'assert';

const SHORT_TO_ECHO: { [x: string]: string } = {
	'00': '2',
	'01': '16',
};
// TODO: throw UtilError
export function ethAddrToEchoId(addr: string) {
	ok(addr.length === 40);
	const short = SHORT_TO_ECHO[addr.substr(0, 2)];
	if (!short) throw new Error('unknown short type');
	const hexId = addr.substr(-16);
	const id = Number.parseInt(hexId, 16);
	return `1.${short}.${id}`;
}

export function inline(str: string, replaceWith = ' ') {
	return str.replace(/[\r\n\s]+/g, replaceWith);
}

export function escapeRegExp(str: string) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
