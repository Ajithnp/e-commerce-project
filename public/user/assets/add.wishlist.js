
async function addToWishlist(productId) {

    const authResponse = await fetch('/api/user/check-auth');

    const authData = await authResponse.json();
    if (!authData.isAuthenticated) {
        // Show SweetAlert instead of redirecting immediately
        Swal.fire({
            title: 'You need to log in!',
            text: 'Please log in to add items to your cart.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Login',
            cancelButtonText: 'OK'
        }).then((result) => {
            if (result.isConfirmed) {
                // Redirect to login page if user clicks "Login"
                window.location.href = '/user/login'; 
            }
            
        });
        return;
    }

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
    Toastify({
        text: "Product already in wishlist!",
        duration: 3000, 
        close: true,   
        gravity: "top", 
        position: "right", // 
        backgroundColor: "#f87171",
        stopOnFocus: true,
        className: "custom-toast", 
        icon: "fas fa-circle-exclamation",
    }).showToast();
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