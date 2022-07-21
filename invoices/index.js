const niceInvoice = require("nice-invoice");
const {priceToRupiah, dateFormatter} = require('../helpers/helper')

function printInvoice(data){
    console.log('MASUK INDEX');
    let itemFix = data.shoesData.map(el => {
        return {
            item: 'Basketball Shoes',
            description: el.description,
            quantity: el.quantity,
            price: el.price,
            tax: ""
        }
    })
    let invoiceDetail = {
        shipping: {
          name: `${data.profileFix.name}`,
          address: `${data.profileFix.address}`,
          city: `${data.profileFix.city}`,
          state: `${data.profileFix.state}`,
          country: `${data.profileFix.country}`,
          postal_code: `${data.profileFix.postalCode}`
        },
        items: itemFix,
        subtotal: data.totalPrice,
        total: data.totalPrice,
        order_number: data.orderNumber,
        header:{
            company_name: "Hacktiv Sport",
            company_logo: "",
            company_address: "Jl. Sultan Iskandar Muda No.7, RT.5/RW.9, Kby. Lama Sel., Kec. Kby. Lama, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 1224"
        },
        footer:{
          text: `Thanks for shopping at Hacktiv Sport, ${data.profileFix.name}!`
        },
        currency_symbol:"Rp", 
        date: {
          billing_date: dateFormatter(),
          due_date: dateFormatter(3),
        }
    };
    // return invoiceDetail
    
    niceInvoice(invoiceDetail, `${data.profileFix.name}.pdf`);
    console.log('DONE');
}

// let data = {
//     name:'Angga3',
//     caption: 'Mantap Bossku',
//     price: 10000,
//     location: 'Jakarta'
// }

// printInvoice(data) ;

module.exports = printInvoice ;

// let data1 = {
//     shoesData: [
//       {
//         id: 6,
//         price: 120,
//         description: 'Nike Air Zoom G.T. Run',        
//         quantity: 1
//       },
//       { id: 5, price: 90, description: 'Nike PG 5', quantity: 2 },
//       { id: 9, price: 659000, description: 'Ardiles AD2 ', quantity: 1 }
//     ],
//     profileFix: {
//       name: 'Klay Thompson',
//       address: 'Jalan Jenderal Ahmad Yani (Warung Jambu)',
//       city: 'Bogor',
//       state: 'Jawa Barat',
//       country: 'Indonesia',
//       postalCode: '12345'
//     },
//     totalPrice: 659210,
//     orderNumber: 16584110790574
//   }

//   printInvoice(data1)