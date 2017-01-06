import * as journey from '../service/journey';

export const plan = async ctx => {
    ctx.type = 'json';
    ctx.body = await journey.plan(ctx.params.from, ctx.params.to);
};
