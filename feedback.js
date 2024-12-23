import { database } from './firebase';
import { ref, push } from "./firebase";

window.submitFeedback = function () {
    const selectedStar = document.querySelector('input[name="stars"]:checked');
    const feedbackText = document.getElementById('feedback-text').value.trim();

    if (!selectedStar || feedbackText === '') {
        alert("Please provide both a star rating and feedback text.");
        return;
    }

    const feedbackData = {
        stars: parseInt(selectedStar.value),
        text: feedbackText,
        timestamp: new Date().toISOString()
    };

    // Push feedback to Firebase
    const feedbackRef = ref(database, 'feedbacks');
    push(feedbackRef, feedbackData)
        .then(() => {
            alert("Thank you for your feedback!");
            // Clear the form
            document.querySelector('input[name="stars"]:checked').checked = false;
            document.getElementById('feedback-text').value = '';
            document.getElementById('feedback-form').style.display = 'none';
        })
        .catch((error) => {
            console.error("Error saving feedback:", error);
            alert("An error occurred. Please try again.");
        });
};
