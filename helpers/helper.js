function priceToRupiah(price){
    return price.toLocaleString("id-ID", {style:"currency", currency:"IDR"});
}

function dateFormatter(number){
    if(!number){
        let date = new Date()
        let text = date.toUTCString().substring(-1, 16)
        return text ;
    } else {
        let date = new Date()
        date.setDate(date.getDate() + number);
        let text = date.toUTCString().substring(-1, 16)
        return text ;
    }
}


module.exports = {priceToRupiah, dateFormatter}