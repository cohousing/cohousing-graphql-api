export const RootResolvers = {
    Query: {
        info(obj, args, {tenant}) {
            return {
                name: tenant.name
            }
        }
    }
};