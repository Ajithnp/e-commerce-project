async function addToCart(productId, buttonElement) {  // from wishlist

    const cartButtonElement = document.getElementById(`add-to-cart-${productId}`);
    const selectedColor = cartButtonElement.dataset.defaultColor;
   
    
    let quantity = 1;
    let color = selectedColor;
    let flag = true;
  

    
 try{
    const result = await Swal.fire({
        title: 'Add to Cart?',
        // html: `
        //     <p><strong>Product Name:</strong> ${}</p>
        //     <p><strong>Price:</strong> $${}</p>
        // `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Add to Cart',
        cancelButtonText: 'Cancel'
    });
    if(result.isConfirmed){
        const response = await fetch('/beats/user/cart/add',{
            method: 'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                productId,
                quantity,
                color,
                flag

            })
        });
        if (!response.ok) {
            const errorData = await response.json();

            if (errorData.message === 'This item is already in your cart.') {
                // Show SweetAlert with Go to Cart option
                await Swal.fire({
                    title: 'Info',
                    text: errorData.message,
                    icon: 'info',
                    confirmButtonText: 'Go to Cart',
                    showCancelButton: true,
                    cancelButtonText: 'Close',
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = '/beats/cart'; // Redirect to cart
                    }
                });
            } else {
                throw new Error(errorData.message || 'An error occurred..!');
            }
        } else {
            const successData = await response.json();
            await Swal.fire({
                title: '<span class="inline-title">✔ Product added to cart!</span>',
                showConfirmButton: false,
                position: "top-end",
                width: '300px',
                background: "black",
                timer: 1000,
                customClass: {
                    popup: 'custom-popup',
                },
            }).then(() => {
                window.location.href = '/beats/cart';
            });
        }

       
    }
  }catch(error){
    console.error('Error adding product to cart:', error.message);

    // Show error notification
    await Swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error',
        confirmButtonText: 'OK'
    });

  }

    
}