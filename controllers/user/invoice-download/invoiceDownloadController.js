const Order = require('../../../models/order-modal')
const OrderItems = require('../../../models/oredr-items-model')
const PdfPrinter = require('pdfmake');
const PDFDocument = require('pdfkit-table');
const { text } = require('pdfkit');

const fonts = {
    Roboto: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      italics: "Helvetica-Oblique",
      bolditalics: "Helvetica-BoldOblique",
    },
  };

const BeatsStudio = "Beats Studio"; 
const shippingFee = 0;
const Home = "Home";

exports.downloadInvoice = async (req, res, next)=>{
    const {orderId} = req.params;

    const userId = req.session.user.id;
 
    try {
      const order = await Order.findOne({ _id: orderId, userId: userId })
      .populate([{

        path:'orderItems',
        populate:{
           path: 'product',
           select: 'productName'
        }
    },
{
    path: 'userId',
    select:'name email phone'

}]);
console.log('order:',order)
  
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
  
    const printer = new PdfPrinter(fonts);
  
    const docDefinition = {
      content: [
        {
          columns: [
            {
              width: "*",
              text: "INVOICE",
              style: "header",
            },
            {
              width: "auto",
              table: {
                widths: ["auto", "auto"],
                body: [
                  [
                    "Order Date:",
                    { text: order.createdAt.toLocaleDateString(), bold: true },
                  ],
                  [
                    "Delivery By:",
                    {
                      text: `${BeatsStudio}`,
                      bold: true,
                    },
                  ],
                ],
              },
              layout: "noBorders",
            },
          ],
        },
        {
          canvas: [{ type: "line", x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 2 }],
        },
        {
          columns: [
            {
              width: "*",
              text: "Bill To",
              style: "subheader",
            },
            {
              width: "*",
              text: "Ship To",
              style: "subheader",
            },
          ],
        },
        {
          columns: [
            {
              width: "*",
              text: [
                {
                  text: `${order.userId.name}\n`,
                  bold: true,
                },
                order.userId.email,
              ],
            },
            {
              width: "*",
              text: [
                {
                  text: `${Home}\n`,
                  bold: true,
                },
                `${order.shippingAddress1}\n`,
                `${order.country}, ${order.city} ${order.zip}\n`,
                `Phone: ${order.phone}`,
              ],
            },
          ],
        },
        {
          text: "Order Details",
          style: "subheader",
          margin: [0, 20, 0, 10],
        },
        {
          table: {
            headerRows: 1,
            widths: ["*", "auto", "auto", "auto", "auto", "auto"],
            body: [
              [
                { text: "Product", style: "tableHeader" },
                { text: "Color", style: "tableHeader" },
                { text: "Qty", style: "tableHeader" },
                { text: "Price", style: "tableHeader" },
                { text: "Total", style: "tableHeader" },
                { text: "Status", style: "tableHeader" },
              ],
              ...order.orderItems.map((item) => [
                { text: item.product.productName }, // Ensure cell has text
                { text: item.color },               // Ensure cell has text
                { text: item.quantity.toString() }, // Ensure cell has text
                { text: `RS :${item.price}` },      // Ensure cell has text
                { text: `RS :${item.totalPrice}` }, // Ensure cell has text
                { text: order.orderStatus, bold: true },
              ]),
            ],
          },
        },
        


        {
          columns: [
            { width: "*", text: "" },
            {
              width: "auto",
              style: "totals",
              table: {
                widths: ["auto", "auto"],
                body: [
                  [
                    {
                      text: "Order Summary",
                      style: "subheader",
                      colSpan: 2,
                      alignment: "center",
                    },
                    {},
                  ],
                  [
                    "Subtotal:",
                    {
                      text: `RS :${order.subTotal.toFixed(2)}`,
                      alignment: "right",
                    },
                  ],
                  [
                    "Shipping Fee:",
                    {
                      text: `RS :${shippingFee.toFixed(2)}`,
                      alignment: "right",
                    },
                  ],
                  [
                    "Coupon Discount:",
                    {
                      text: `RS :${order.couponDiscount.toFixed(2)}`,
                      alignment: "right",
                    },
                  ],
                  [
                    { text: "Total Discount:" },
                    {
                      text: `RS :${order.totalDiscount.toFixed(2)}`,
                      alignment: "right",
                    },
                  ],
                  [
                    { text: "Grand Total:", bold: true },
                    {
                      text: `RS :${order.totalAmount.toFixed(2)}`,
                      bold: true,
                      alignment: "right",
                    },
                  ],
                ],
              },
              layout: {
                hLineWidth: function (i, node) {
                  return i === 0 || i === node.table.body.length ? 2 : 1;
                },
                vLineWidth: function (i, node) {
                  return 0;
                },
                hLineColor: function (i, node) {
                  return i === 0 || i === node.table.body.length
                    ? "black"
                    : "gray";
                },
                paddingLeft: function (i, node) {
                  return 10;
                },
                paddingRight: function (i, node) {
                  return 10;
                },
                paddingTop: function (i, node) {
                  return 5;
                },
                paddingBottom: function (i, node) {
                  return 5;
                },
              },
            },
          ],
        },
        {
          text: "Payment Information",
          style: "subheader",
          margin: [0, 20, 0, 5],
        },
        {
          table: {
            widths: ["auto", "*"],
            body: [
              ["Payment Method:", { text: order.paymentMethod, bold: true }],
              ["Payment Status:", { text: order.paymentStatus, bold: true }],
            ],
          },
          layout: {
            hLineWidth: function (i, node) {
              return i === 0 || i === node.table.body.length ? 2 : 1;
            },
            vLineWidth: function (i, node) {
              return 0;
            },
            hLineColor: function (i, node) {
              return i === 0 || i === node.table.body.length ? "black" : "gray";
            },
            paddingLeft: function (i, node) {
              return 10;
            },
            paddingRight: function (i, node) {
              return 10;
            },
            paddingTop: function (i, node) {
              return 5;
            },
            paddingBottom: function (i, node) {
              return 5;
            },
          },
        },
      ],
      styles: {
        header: {
          fontSize: 28,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5],
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: "black",
        },
        totals: {
          margin: [0, 30, 0, 0],
        },
      },
      defaultStyle: {
        fontSize: 10,
      },
    };
  
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
  
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order.orderId}.pdf`
    );
  
    pdfDoc.pipe(res);
    pdfDoc.end();
    } catch (error) {
      console.error('An error occured while downloading invoice!',error)
      next(error)
    }
               
               

}