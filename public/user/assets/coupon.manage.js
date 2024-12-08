const couponInput = document.getElementById("coupon-code");
const applyButton = document.getElementById("applyCoupon");
const removeButton = document.getElementById("removeCoupon");
const subTotal = document.getElementById('sub-value').value.trim()
const userInfo = document.getElementById('user-id').value.trim();
let couponDiscountAmount = 0;

// Actions 

// Add coupon
applyButton.addEventListener('click', async()=>{
    const couponCode = couponInput.value;
    
    if(!couponCode){
        Swal.fire({
            icon: "warning",
                title: "Coupon Code Required",
                text: "Please enter a coupon code before applying!",
                confirmButtonText: "Okay",
                timer: 3000,
        });
        return;
        
    }

    try {
        const response = await fetch('/coupons/apply',{
            method: 'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify({couponCode,subTotal,userId:userInfo})
        });

        const result = await response.json();

        if(response.ok){

            discountAmount = result.discountAmount;
            // updateTotalAmount(discountAmount);
            Swal.fire({
                icon: "success",
                title: "Coupon Applied",
                text: `Coupon "${couponCode}" applied successfully!`,
                confirmButtonText: "Awesome!",
            });

            applyButton.disabled = true;
            removeButton.disabled = false;
            couponInput.disabled = true;
        }else{
            Swal.fire({
                icon: "error",
                title: "Failed to Apply Coupon",
                text: result.message || "Something went wrong!",
                confirmButtonText: "Try Again",
            });
        }

        

    } catch (error) {
        console.error("Error applying coupon:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Something went wrong! Please try again later.",
            confirmButtonText: "Okay",
        });
        
    }
})

//Coupon remove!
removeButton.addEventListener('click', async ()=>{
    const couponCode = couponInput.ariaValueMax.trim();

    try {
        const response = await fetch('/coupon/remove',{
            method: 'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({couponCode})
        });

        const result = await response.json();

        if(response.ok){

            discountAmount = 0;
            // updateTotalAmount(discountAmount);
            Swal.fire({
                icon: "success",
                title: "Coupon Removed",
                text: "Your coupon has been successfully removed.",
                confirmButtonText: "Okay",
            });
            applyButton.disabled = false;
            removeButton.disabled = true;
            couponInput.disabled = false;
            couponInput.value = "";
        }else{
            Swal.fire({
                icon: "error",
                title: "Failed to Remove Coupon",
                text: result.message || "Something went wrong!",
                confirmButtonText: "Try Again",
            });
        }
    } catch (error) {
        console.error("Error removing coupon:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Something went wrong! Please try again later.",
            confirmButtonText: "Okay",
        });
        
    }
})

// function updateTotalAmount(couponDiscountAmount){
//     const subtotalElement = document.getElementById('subtotal');

//     const totalElement = document.getElementById('total');

//     let subtotal = parseFloat(subtotalElement.textContent.replace('rs', ''));
//     let newTotal = subtotal - discount;
//     totalElement.textContent = `$${newTotal.toFixed(2)}`;
// }
