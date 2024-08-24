const loginForm = document.querySelector(".login-form");

loginForm.addEventListener("submit", (event) => login(event))

/**
 * SUBMIT EVENT
 */
async function login(event) {
    try {
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

        // Check email / password
        if (!response.ok) {
            document.querySelector(".invalid-user").style.visibility = "visible"
            throw new Error(`Les informations utilisateur / mot de passe ne sont pas correctes (${response.status}).`)
        }

        const responseMessage = await response.json();
        // Store Token to local storage
        localStorage.setItem("loginToken", responseMessage["token"])

        // Redirect to 'index.html'
        window.location.replace("index.html")
    }
    catch (error) {
        alert(error)

    }
};

console.log('fdfsd :>> ', fdfsd);

