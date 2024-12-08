async function deleteCoupon(couponId){
    console.log('coupon id hiii', couponId)

    Swal.fire({
        title: 'Are you sure?', 
        text: 'Do you want to delete this coupon?', 
        icon: 'warning', 
        showCancelButton: true, 
        confirmButtonColor: '#e53e3e',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!', 
        cancelButtonText: 'Cancel', 
      }).then(async(result)=>{
        if(result.isConfirmed){

            try {
                const response = await fetch(`/api/v1/admin/coupons/delete/${couponId}`,{
                    method: 'DELETE'
                })
                if(!response.ok){
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'An error occured..!');
                }
                const successData = await response.json();
                Swal.fire({
                    icon: 'success',
                    title : 'Success',
                    text: successData.message,

                }).then(()=>{
                    window.location.reload();
                })
            }catch(error){
                console.error('An error occured while deleting coupon..!', error);
                Swal.fire({
                    icon: 'error',
                    titile: 'Oops!',
                    text: error.message
                })
            }

        }
      }) 
}

// Unlist coupon function

async function confirmUnlist(couponId){
    Swal.fire({
        title: 'Are you sure?', 
        text: 'Do you want to Unlist this coupon?', 
        icon: 'warning', 
        showCancelButton: true, 
        confirmButtonColor: '#e53e3e',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!', 
        cancelButtonText: 'Cancel', 
      }).then(async(result)=>{
        if(result.isConfirmed){
            try{
            const response = await fetch(`/api/v1/admin/coupons/unlist/${couponId}`,{method:'PATCH'})

            if(!response.ok){
                const errorData = await response.json()
                throw new Error(errorData.message || 'An error occured..!')
            }

            const successData = await response.json()
            Swal.fire({
                icon: 'success',
                title : 'Success',
                text: successData.message,

            }).then(()=>{
                window.location.reload();
            })
        }  catch(error){
            console.error('An error occured while unlisting coupon..!', error);
                Swal.fire({
                    icon: 'error',
                    titile: 'Oops!',
                    text: error.message
                })

        }

        }

      })
}

// Unlist coupon function

async function confirmList(couponId){
    Swal.fire({
        title: 'Are you sure?', 
        text: 'Do you want to List this coupon?', 
        icon: 'warning', 
        showCancelButton: true, 
        confirmButtonColor: '#e53e3e',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!', 
        cancelButtonText: 'Cancel', 
      }).then(async(result)=>{
        if(result.isConfirmed){
            try{
            const response = await fetch(`/api/v1/admin/coupons/list/${couponId}`,{method:'PATCH'})

            if(!response.ok){
                const errorData = await response.json()
                throw new Error(errorData.message || 'An error occured..!')
            }

            const successData = await response.json()
            Swal.fire({
                icon: 'success',
                title : 'Success',
                text: successData.message,

            }).then(()=>{
                window.location.reload();
            })
        }  catch(error){
            console.error('An error occured while listing coupon..!', error);
                Swal.fire({
                    icon: 'error',
                    titile: 'Oops!',
                    text: error.message
                })

        }

        }

      })
}

// Edit button Get
function editCoupon(couponId){
    window.location.href = `http://localhost:3001/api/v1/admin/coupons/edit/${couponId}`;
}