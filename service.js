
/**
 * @name simpleOrderMatchingEngine
 * @description Check if there is any order that has the same price
 *  If it exist remove order else add to orderbooks instance
 *  
 * */ 
const simpleOrderMatchingEngine = (orderBooks, orders) => {
        const newOrderBooks = [...orderBooks];

        const newOrderBookObject = {};

        // Make an object from the orderBooks instance
        newOrderBooks.forEach(
            order => {
                newOrderBookObject[`${order.book}|${order.price}`] = true;
            }
        )

        // Add remainer to the orderBooks instance
        orders.forEach(
            order => {

                if(!newOrderBookObject[`${order.book}|${order.price}`]){
                    newOrderBooks.push(order);
                }
            }
        )
        
        return newOrderBooks;
}

module.exports = {
    simpleOrderMatchingEngine
}