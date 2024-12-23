import { auth, db, collection, addDoc, getDocs, getDoc, doc, updateDoc } from './firebase.js';

// Function to post a response
document.getElementById('post-response').addEventListener('click', async () => {
    const title = document.getElementById('response-title').value;
    const text = document.getElementById('response-text').value;

    if (title && text) {
        try {
            // Add response to Firestore
            const docRef = await addDoc(collection(db, "responses"), {
                title: title,
                text: text,
                timestamp: new Date(),
                likes: 0,
                dislikes: 0,
                replies: [], // Initialize as empty array
                likedBy: [], // Keep track of users who liked
                dislikedBy: [] // Keep track of users who disliked
            });
            console.log("Response posted with ID: ", docRef.id);

            // Clear form fields
            document.getElementById('response-title').value = '';
            document.getElementById('response-text').value = '';

            // Reload responses
            loadResponses();
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    } else {
        alert("Please provide both title and response text.");
    }
});

// Handle like/dislike (only once per user)
async function handleLikeDislike(docId, action, isReply = false, replyId = null) {
    try {
        const user = auth.currentUser; // Get the current logged-in user
        if (!user) {
            alert("Please log in to like or dislike.");
            return;
        }

        const docRef = doc(db, "responses", docId);
        const docSnapshot = await getDoc(docRef);

        if (docSnapshot.exists()) {
            const responseData = docSnapshot.data();
            const likedBy = responseData.likedBy || [];
            const dislikedBy = responseData.dislikedBy || [];

            let updatedLikes = responseData.likes;
            let updatedDislikes = responseData.dislikes;

            // Handle like/dislike for main response or reply
            if (isReply) {
                // Handle replies separately
                const replies = responseData.replies;
                const reply = replies.find(r => r.replyId === replyId);

                const replyLikedBy = reply.likedBy || [];
                const replyDislikedBy = reply.dislikedBy || [];

                // Check if user has already liked or disliked this reply
                if (action === "like" && replyLikedBy.includes(user.uid)) {
                    alert("You have already liked this reply.");
                    return;
                }

                if (action === "dislike" && replyDislikedBy.includes(user.uid)) {
                    alert("You have already disliked this reply.");
                    return;
                }

                // Update like/dislike for the reply
                if (action === "like") {
                    reply.likes += 1;
                    replyLikedBy.push(user.uid);
                } else if (action === "dislike") {
                    reply.dislikes += 1;
                    replyDislikedBy.push(user.uid);
                }

                // Update Firestore with the new reply data
                await updateDoc(docRef, {
                    [`replies.${replies.findIndex(r => r.replyId === replyId)}.likes`]: reply.likes,
                    [`replies.${replies.findIndex(r => r.replyId === replyId)}.dislikes`]: reply.dislikes,
                    [`replies.${replies.findIndex(r => r.replyId === replyId)}.likedBy`]: replyLikedBy,
                    [`replies.${replies.findIndex(r => r.replyId === replyId)}.dislikedBy`]: replyDislikedBy
                });

            } else {
                // Handle main response
                if (action === "like" && likedBy.includes(user.uid)) {
                    alert("You have already liked this response.");
                    return;
                }

                if (action === "dislike" && dislikedBy.includes(user.uid)) {
                    alert("You have already disliked this response.");
                    return;
                }

                if (action === "like") {
                    updatedLikes += 1;
                    likedBy.push(user.uid);
                } else if (action === "dislike") {
                    updatedDislikes += 1;
                    dislikedBy.push(user.uid);
                }

                // Update Firestore document with new like/dislike counts and user actions
                await updateDoc(docRef, {
                    likes: updatedLikes,
                    dislikes: updatedDislikes,
                    likedBy: likedBy,
                    dislikedBy: dislikedBy
                });
            }

            console.log(`Document updated with ID: ${docId}`);
            loadResponses(); // Reload the responses to reflect changes
        } else {
            console.log("No such document!");
        }
    } catch (e) {
        console.error("Error updating document: ", e);
    }
}

// Event listener for like/dislike and reply buttons
document.getElementById('responses-list').addEventListener('click', (event) => {
    if (event.target.classList.contains('like-btn')) {
        const docId = event.target.dataset.id;
        handleLikeDislike(docId, "like");
    } else if (event.target.classList.contains('dislike-btn')) {
        const docId = event.target.dataset.id;
        handleLikeDislike(docId, "dislike");
    } else if (event.target.classList.contains('reply-btn')) {
        const docId = event.target.dataset.id;
        handleReply(docId);
    } else if (event.target.classList.contains('reply-like-btn')) {
        const docId = event.target.dataset.docId;
        const replyId = event.target.dataset.replyId;
        handleLikeDislike(docId, "like", true, replyId);
    } else if (event.target.classList.contains('reply-dislike-btn')) {
        const docId = event.target.dataset.docId;
        const replyId = event.target.dataset.replyId;
        handleLikeDislike(docId, "dislike", true, replyId);
    } else if (event.target.classList.contains('give-feedback-btn')) {
        showFeedback(docId)
    }
});

// Function to show the reply input box
function handleReply(docId) {
    const responseElement = document.querySelector(`[data-id="${docId}"]`).closest('.response');
    let replyInput = responseElement.querySelector('.reply-input');

    // If the input box doesn't exist, create one
    if (!replyInput) {
        replyInput = document.createElement('textarea');
        replyInput.classList.add('reply-input');
        replyInput.placeholder = "Type your reply...";

        const replyButton = document.createElement('button');
        replyButton.textContent = "Post Reply";
        replyButton.addEventListener('click', () => {
            postReply(docId, replyInput.value);
        });

        // Add the input box and button
        responseElement.appendChild(replyInput);
        responseElement.appendChild(replyButton);
    }
}

// Function to post a reply
async function postReply(docId, replyText) {
    if (replyText.trim() === "") {
        alert("Please write a reply.");
        return;
    }

    try {
        const docRef = doc(db, "responses", docId);

        // Fetch the document's data
        const docSnapshot = await getDoc(docRef);

        if (docSnapshot.exists()) {
            const responseData = docSnapshot.data();
            const replies = responseData.replies || [];

            // Create a new reply object
            const newReply = {
                replyId: replies.length + 1,
                text: replyText,
                likes: 0,
                dislikes: 0,
                likedBy: [],
                dislikedBy: []
            };

            // Add the new reply to the replies array
            replies.push(newReply);

            // Update Firestore with the new reply
            await updateDoc(docRef, {
                replies: replies
            });

            console.log(`Reply added to document with ID: ${docId}`);
            loadResponses(); // Reload the responses to reflect changes
        } else {
            console.log("No such document!");
        }
    } catch (e) {
        console.error("Error posting reply: ", e);
    }
}






function showFeedback() {
    
}





















// Load responses function with replies hidden by default
async function loadResponses() {
    const responsesList = document.getElementById('responses-list');
    responsesList.innerHTML = ''; // Clear the list before displaying new responses

    try {
        const querySnapshot = await getDocs(collection(db, "responses"));
        querySnapshot.forEach((doc) => {
            const responseData = doc.data();
            const responseElement = document.createElement('div');
            responseElement.classList.add('response');
            responseElement.dataset.id = doc.id; // Store the document ID for later use

            responseElement.innerHTML = `
                <h4>${responseData.title}</h4>
                <p>${responseData.text}</p>
                <div class="response-actions">
                    <button class="like-btn" data-id="${doc.id}">Like (${responseData.likes})</button>
                    <button class="dislike-btn" data-id="${doc.id}">Dislike (${responseData.dislikes})</button>
                    <button class="reply-btn" data-id="${doc.id}">Reply</button>
                    <button class="show-reply-btn" data-id="${doc.id}">Show Replies</button>
                </div>
                <div class="replies" style="display: none;">
                    ${responseData.replies ? responseData.replies.map(reply => `
                        <div class="reply" data-reply-id="${reply.replyId}">
                            <p>${reply.text}</p>
                            <div class="reply-actions">
                                <button class="reply-like-btn" data-doc-id="${doc.id}" data-reply-id="${reply.replyId}">Like (${reply.likes})</button>
                                <button class="reply-dislike-btn" data-doc-id="${doc.id}" data-reply-id="${reply.replyId}">Dislike (${reply.dislikes})</button>
                            </div>
                        </div>
                    `).join('') : ''}
                </div>
            `;
            responsesList.appendChild(responseElement);
        });

        // Add event listener for toggling replies visibility
        responsesList.addEventListener('click', (event) => {
            if (event.target.classList.contains('show-reply-btn')) {
                const responseElement = event.target.closest('.response');
                const repliesElement = responseElement.querySelector('.replies');

                if (repliesElement.style.display === 'none') {
                    repliesElement.style.display = 'block';
                    event.target.textContent = 'Hide Replies';
                } else {
                    repliesElement.style.display = 'none';
                    event.target.textContent = 'Show Replies';
                }
            }
        });

    } catch (e) {
        console.error("Error getting documents: ", e);
    }
}

// Initial load
loadResponses();
