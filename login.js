import { auth, signInWithEmailAndPassword } from './firebase.js'

// Handle login form submission
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Sign in the user using Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Successfully logged in
        console.log("Logged in as:", user.email);
        alert("Login successful!");
        
        // Redirect to another page or update UI
        window.location.href = "../html/response.html";  // Example redirect

    } catch (error) {
        console.error("Error during login:", error.message);
        alert("Invalid credentials. Please try again.");
    }
});