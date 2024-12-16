const couponInput = document.getElementById("coupon-code");
const applyButton = document.getElementById("applyCoupon");
const removeButton = document.getElementById("removeCoupon");
const subTotal = document.getElementById('sub-value').value.trim()
const userInfo = document.getElementById('user-id').value.trim();
const subtotalElement = document.getElementById('subTotalAmount');
const grandTotalElement = document.getElementById('grandTotalAmount');
let discountAmount = 0;

// Actions 


 // Check if there's a stored coupon in session storage
 const storedCouponCode = sessionStorage.getItem('appliedCouponCode');
 
 if (storedCouponCode) {
     couponInput.value = storedCouponCode;
     applyCoupon(storedCouponCode); // Automatically apply stored coupon
 }

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
           
            const couponDiscountAmount = result.discountAmount;
            const couponCode = result.codeOfCoupon;
             const couponId = result.couponId
            sessionStorage.setItem('appliedCoupon', JSON.stringify({ couponDiscountAmount, couponCode,couponId }));


             discountAmount = Math.round(result.discountAmount);
            const newGrandTotal = Math.round(parseFloat(subTotal) - discountAmount);
            // updateTotalAmount(discountAmount);
            
            // Update the coupon discount and grand total in the DOM
            document.getElementById('couponDiscountAmount').innerText = `₹ -${discountAmount.toFixed(2)}`;
            grandTotalElement.innerText = `₹${newGrandTotal.toFixed(2)}`;

            // Store applied coupon code in session storage
            sessionStorage.setItem('appliedCouponCode', couponCode);

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
    const couponCode = couponInput.value.trim();

    try {
        const response = await fetch('/coupons/remove',{
            method: 'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({couponCode})
        });

        const result = await response.json();

        if(response.ok){

            discountAmount = 0;
             // Update totals back to normal
             document.getElementById('couponDiscountAmount').innerText = '₹0.00';

             // Reset grand total
             grandTotalElement.innerText = subtotalElement.innerText; 
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

            // Clear stored coupon from session storage
            sessionStorage.removeItem('appliedCouponCode');
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



// Refresh apply coupon function.!

async function applyCoupon(couponCode){
    const subtotal = document.getElementById('sub-value').value.trim()
    try {
        const response = await fetch('/coupons/apply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ couponCode, subTotal: subtotal })
        });
        const result = await response.json();

        if (response.ok) {
            const couponDiscountAmount = result.discountAmount;
            const couponCode = result.codeOfCoupon;
            const couponId = result.couponId
            sessionStorage.setItem('appliedCoupon', JSON.stringify({ couponDiscountAmount, couponCode,couponId }));
            
            // Assuming result contains discountAmount
            const discountAmount =Math.round(result.discountAmount); 
            const newGrandTotal = Math.round(parseFloat(subTotal) - discountAmount);

            // Update displayed amounts
            document.getElementById('couponDiscountAmount').innerText = `₹ -${discountAmount.toFixed(2)}`;
            document.getElementById('grandTotalAmount').innerText = `₹${newGrandTotal.toFixed(2)}`;

            // Store applied coupon code in session storage
            sessionStorage.setItem('appliedCouponCode', couponCode);

            applyButton.disabled = true;
            removeButton.disabled = false;
            couponInput.disabled = true;
        }
    } catch (error) {
        console.error("Error applying coupon:", error);
        
    }
}





// function updateTotalAmount(couponDiscountAmount){
//     const subtotalElement = document.getElementById('subtotal');

//     const totalElement = document.getElementById('total');

//     let subtotal = parseFloat(subtotalElement.textContent.replace('rs', ''));
//     let newTotal = subtotal - discount;
//     totalElement.textContent = `$${newTotal.toFixed(2)}`;
// }
