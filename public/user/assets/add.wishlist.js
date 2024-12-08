async function addToWishlist(productId) {

    try{
   
    const response = await fetch('/beats/user/wishlist/add',{
        method: 'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify({productId})

    })

    if(!response.ok){
        errorResponse = await response.json();
        throw new Error(errorResponse.message || 'An error occred..!')
    }

    const successResponse = await response.json();
    Swal.fire({
        title: '<span class="inline-title"><i class="fas fa-heart"></i> Product added to wishlist!</span>',
                showConfirmButton: false,
                 width: '300px', // Set the desired width here
                 background: "black",
                 timer: 1000,
                 customClass: {
                 popup: 'custom-popup', 
                },  
    }).then(()=>{
        window.location.reload();
    })

   }catch(error){
    console.error('An error occured while add item to wishlist..!');
    Swal.fire({
        showConfirmButton: false,
        // icon: 'error',
        background: 'white',
        timer: 1000,
        title: '<span class="inline-title"><i class="fas fa-circle-exclamation"></i> Product already in wishlist!</span>',
        // text: error.message,
        customClass: {
            popup: 'custom-popup', 
           },
        
    });
   }
}

// Item remove from wishlist.
async function removeFromWishlist(productId){
    const result = await Swal.fire({
        title: 'Remove product from wishlist?',
        text: "Are you sure you want to remove this product?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!',
        cancelButtonText: 'No!'

    })
    if(result.isConfirmed){
        try {
            const response = await fetch(`/beats/user/wishlist/remove/${productId}`,{
                method: 'DELETE',
                headers:{
                    'Content-Type':'application/json'
                },
               

            })
            
            if(!response.ok){
                const errorResponse = await response.json();
                throw new Error(errorResponse.message || 'An error occured..!')
            }

            const successResponse = await response.json();
            window.location.reload();
        } catch (error) {
            console.error('An error occurred during logout:', error);
            Swal.fire({
                title: 'Error!',
                text: error.message,
                icon: 'error',
                confirmButtonText: 'OK'
            });
            
        }
    }
    

}