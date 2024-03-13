import assert from 'assert';

import clients from '../../clients';
import { IOperation } from '../../interfaces';
import { ActionInput, EntitiesSearchInput, Entity } from '../../types';

export default class EntitiesSearchOperation implements IOperation {
	constructor(private input: ActionInput) {
		this.input = input;
	}

	private parseInput = (): EntitiesSearchInput => {
		assert.notDeepEqual(this.input.query, [], 'SEARCH Operation - query is missing from input');

		const searchBodySchema = this.input.query?.length ? JSON.parse(this.input.query.join('')) : {};

		return {
			searchBody: searchBodySchema,
			exclude: this.input.exclude,
		};
	};

	execute = async (): Promise<Record<string, any>> => {
		const { searchBody, exclude } = this.parseInput();
		const accessToken = await clients.port.getToken(this.input.baseUrl, this.input.clientId, this.input.clientSecret);

		const entities: Entity[] = await clients.port.searchEntities(this.input.baseUrl, accessToken, searchBody);

		// if exclude is provided, filter out the entities
		if (exclude) {
			const filteredEntities = entities.filter((entity) => !exclude.includes(entity.identifier));
			return { entities: filteredEntities };
		}

		return { entities };
	};
}
