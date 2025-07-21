export default async (event, context) => {
    const { productName, quantity, unit } = event.payload;
    context.log(`Registering new product: ${productName}, ${quantity} ${unit}`);

    // Here, save to DB or perform business logic
    await context.emit('product.created', {
        productName,
        quantity,
        unit
    });
};
