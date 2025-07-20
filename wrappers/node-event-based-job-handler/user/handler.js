export default async (event, context) => {
    const { user } = event.payload;
    context.log(`Handling new user: ${user.name}`);

    await context.emit('user.created', {
        email: user.email,
        name: user.name
    });
};