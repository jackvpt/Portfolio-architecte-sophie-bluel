const loginForm = document.querySelector(".login-form");

// ---------------------------------------------
// SUBMIT EVENT
// ---------------------------------------------
loginForm.addEventListener("submit", async function (event) {
    // Prevent submit default action
    event.preventDefault();

    // Get email and password from DOM
    const loginEmail = document.querySelector("#email").value;
    const loginPassword = document.querySelector("#password").value;

    // API query
    const response = await fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: loginEmail,
            password: loginPassword,
        }),
    });

    const responseMessage = await response.json();
    
    // Check API response
    if (responseMessage["message"] === "user not found") {
        document.querySelector(".invalid-user").style.visibility = "visible"
    } else {
        document.querySelector(".invalid-user").style.visibility = "hidden"
        // Store Token to local storage
        localStorage.setItem("loginToken", responseMessage["token"])
        window.location.replace("index.html")
    }
});
