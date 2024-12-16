async function acceptReturn(returnId){
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to accept this return request?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#48bb78', 
            cancelButtonColor: '#e53e3e',
            confirmButtonText: 'Yes, accept it!',
            cancelButtonText: 'Cancel'
        });
        if(result.isConfirmed){
            const response = await fetch(`/api/v1/admin/order/item/return/accept/${returnId}`,{
                method:'POST',
               
            });

            const responseData = await response.json();

            if(response.ok){
                await Swal.fire(
                    'Accepted!',
                    responseData.message,
                    'success'
                );
            }else{
                throw new Error(responseData.message || 'Failed to accept the return request');
            }

            setTimeout(() => {
                window.location.reload();
            }, 2000);

        }else{
            
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error!', error.message, 'error');
    }
}

// Reject user product return request;

async function rejectReturn(returnId){
    try {

        const confirmResult = await Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to reject this return request?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#48bb78', 
            cancelButtonColor: '#e53e3e',
            confirmButtonText: 'Yes, reject it!',
            cancelButtonText: 'Cancel'
        });

        if (!confirmResult.isConfirmed) {
            return; 
        }

        const { value: rejectionReason } = await Swal.fire({
            title: 'Select Rejection Reason',
            input: 'select',
            inputOptions: {
                'Product not eligible for return': 'Product not eligible for return',
                'Return request exceeds allowed time frame': 'Return request exceeds allowed time frame',
                'Product condition does not meet return policy': 'Product condition does not meet return policy',
                'Promotional or discounted item is non-returnable': 'Promotional or discounted item is non-returnable',
                'Return policy terms violated': 'Return policy terms violated',
                'Other (specified in description)': 'Other (specified in description)',
            },
            inputPlaceholder: 'Choose a reason',
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) {
                    return 'You need to select a reason!';
                }
            },
        });

        if (!rejectionReason) {
            return;
        }

       
            const response = await fetch(`/api/v1/admin/order/item/return/reject/${returnId}`,{
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({reason:rejectionReason})
               
            });

            const responseData = await response.json();
            if (response.ok) {
                await Swal.fire('Rejected!', responseData.message, 'success');
                setTimeout(() => {
                    window.location.reload(); 
                }, 1500);
            } else {
                throw new Error(responseData.message || 'Failed to reject the return request');
            }
        
    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error!', error.message, 'error');
    }
}

// Function for show order return details.

function showReturnDetails(returnId){
    window.location.href = `/api/v1/admin/order/item/return/view/${returnId}`
}
