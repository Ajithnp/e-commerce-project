
const singleReturnBtn = document.getElementById('single-return-button')



async function returnProduct(productId,orderId,color,quantity,salePrice){
   
    if (!productId || !orderId) {
        console.error('Invalid productId or orderId:', productId, orderId);
        return Swal.fire('Error', 'Invalid product or order ID!', 'error');
    }

    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "Do you really want to return this product? This action cannot be undone.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e53e3e', // Red color for cancel confirmation
        cancelButtonColor: '#48bb78', // Green color for the cancel button
        confirmButtonText: 'Yes, return it!',
        cancelButtonText: 'No, Keep it'
    });
    if(result.isConfirmed){
        // show alert for return reason
        const {value:reason} = await Swal.fire({
            title: 'Product Return Reason',
            input: 'text',
            inputPlaceholder: 'Enter your reason for product return...',
            showCancelButton: true,
            confirmButtonText: 'Submit',
            cancelButtonText: 'Cancel',
            inputValidator: (value) => {
                if (!value) {
                    return 'You need to write something!';
                }
            }
        });
        if(reason){
            try {
                const response = await fetch('/order/product/return',{
                    method:'POST',
                    headers:{
                        'Content-Type':'application/json'
                    },
                    body:JSON.stringify({productId,orderId,color,quantity,reason})
                });
                if(!response.ok){
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'An error occured..!')
                }

                await Swal.fire(
                    'Return Request Submitted!',
                    'Your return request has been successfully sent.',
                    'success'
                   );

          

                   setTimeout(() => {
                    window.location.reload();
                }, 2000); 

                
            } catch (error) {
                console.error('Error return product:', error.message);
                Swal.fire('Error!', error.message, 'error');
            }
        }
    }
    
}