import AbstractModel from './abstract.model';
import { Schema } from 'mongoose';
import { IProposal } from '../interfaces/IProposal';
import * as MODEL from '../constants/model.constants';

export default AbstractModel<IProposal>(MODEL.NAME.PROPOSAL, {
    id: String,
    fee_paying_account: String,
    proposed_ops: [Schema.Types.Mixed],
    expiration_time: String,
    review_period_seconds: Number,
    active_approvals_to_add: [Schema.Types.Mixed],
	active_apprivals_to_remove: [Schema.Types.Mixed],
	owner_approvals_to_remove: [Schema.Types.Mixed],
	key_approvals_to_add: [Schema.Types.Mixed],
	key_approvals_to_remove: [Schema.Types.Mixed],
});
