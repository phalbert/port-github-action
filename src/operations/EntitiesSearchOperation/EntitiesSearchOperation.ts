import assert from 'assert';

import clients from '../../clients';
import { IOperation } from '../../interfaces';
import { ActionInput, EntitiesSearchInput, Entity } from '../../types';
import * as core from '@actions/core';

export default class EntitiesSearchOperation implements IOperation {
	constructor(private input: ActionInput) {
		this.input = input;
	}

	private parseInput = (): EntitiesSearchInput => {
		assert.notDeepEqual(this.input.query, [], 'SEARCH Operation - query is missing from input');

		const searchBodySchema = this.input.query?.length ? JSON.parse(this.input.query.join('')) : {};

		core.info(`excludeProperties ${this.input.excludeProperties}`);

		return {
			searchBody: searchBodySchema,
			excludeProperties: this.input.excludeProperties,
		};
	};

	execute = async (): Promise<Record<string, any>> => {
		const { searchBody, excludeProperties } = this.parseInput();
		const accessToken = await clients.port.getToken(this.input.baseUrl, this.input.clientId, this.input.clientSecret);

		const entities: Entity[] = await clients.port.searchEntities(this.input.baseUrl, accessToken, searchBody);
        

		if (excludeProperties?.length) {

			entities.forEach((entity) => {
				Object.keys(entity.properties).forEach((key) => {
					if (excludeProperties.includes(key)) {
						delete entity.properties[key];
					}
				});
			});
		}
        
		core.info(`EntitiesSearchOperation - Found ${entities.length} entities`);
		
		return { entities };
	};
}
