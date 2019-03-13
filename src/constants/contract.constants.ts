export enum TYPE {
	COMMON = 'common',
	ERC20 = 'erc20',
}

export const ERC20_METHOD_HASHES = [
	'18160ddd',
	'70a08231',
	'dd62ed3e',
	'a9059cbb',
	'095ea7b3',
	'23b872dd',
];

// 18160ddd -> totalSupply()
// 70a08231 -> balanceOf(address)
// dd62ed3e -> allowance(address,address)
// a9059cbb -> transfer(address,uint256)
// 095ea7b3 -> approve(address,uint256)
// 23b872dd -> transferFrom(address,address,uint256)
