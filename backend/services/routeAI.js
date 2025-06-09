const { z } = require('zod');
const { PromptTemplate } = require('@langchain/core/prompts');
const { StructuredOutputParser } = require('@langchain/core/output_parsers');
const { RunnableSequence } = require('@langchain/core/runnables');

class POIRoute {
    constructor(model) {
        this.model = model;
        this.parser = StructuredOutputParser.fromZodSchema(
        z.object({
            route: z.array(
            z.object({
                name: z.string(),
                address: z.string(),
            })
            ).describe('ordered list of locations to visit'),
        })
        );

        this.chain = RunnableSequence.from([
        new PromptTemplate({
            template: `
            Given the city: {city} and the following user locations:
            {locations}

            Suggest an ordered route visiting up to 5 of these locations exactly once, optimized for visiting efficiency.
            Return the ordered list of locations with name and address only, in JSON format.

            {format_instructions}
            `,
            inputVariables: ['city', 'locations'],
            partialVariables: {
            format_instructions: this.parser.getFormatInstructions(),
            },
        }),
        this.model,
        this.parser,
        ]);
    }
        async getLocationRecommendation({ city, locations }) {
        const locsText = locations
            .map(
            (l) =>
                `${l.name}, ${l.address}`
            )
            .join('\n');

        const response = await this.chain.invoke({
            city,
            locations: locsText,
        });

        return response;
        }                
    }
module.exports = POIRoute;