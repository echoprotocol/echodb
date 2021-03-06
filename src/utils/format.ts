import { ok } from 'assert';
import { constants } from 'echojs-lib';

const SHORT_TO_ECHO: { [x: string]: string } = {
	'00': constants.PROTOCOL_OBJECT_TYPE_ID.ACCOUNT.toString(10),
	'01': constants.PROTOCOL_OBJECT_TYPE_ID.CONTRACT.toString(10),
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

export function dateFromUtcIso(str: string) {
	return new Date(`${str}Z`);
}
